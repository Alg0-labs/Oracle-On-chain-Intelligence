import Anthropic from '@anthropic-ai/sdk'
import type {
  WalletData,
  ChatMessage,
  ChatResponse,
  SendTxIntent,
  MarketContext,
} from '../types/index.js'
import dotenv from 'dotenv'

dotenv.config({ override: true })


const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SEND_ETH_TOOL = {
  name: 'send_eth',
  description: 'Execute an ETH transfer to another address',
  input_schema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Ethereum address (0x...)',
      },
      amount: {
        type: 'string',
        description: "Amount in ETH (e.g., '0.1')",
      },
      reason: {
        type: 'string',
        description: 'Brief explanation of transfer',
      },
    },
    required: ['to', 'amount'],
  },
} as const

// ─── Build system prompt from live wallet data ────────────────────────────

function buildSystemPrompt(wallet: WalletData, market: MarketContext): string {
  const tokenSummary = wallet.tokens.length > 0
    ? wallet.tokens.map(t =>
        `  • ${t.symbol} (${t.name}): ${t.balance} tokens = $${t.usdValue.toLocaleString()} ${t.change24h !== undefined ? `(${t.change24h >= 0 ? '+' : ''}${t.change24h.toFixed(1)}% 24h)` : ''}`
      ).join('\n')
    : '  (no ERC-20 tokens found)'

  const txSummary = wallet.transactions.length > 0
    ? wallet.transactions.slice(0, 10).map(tx =>
        `  • ${tx.description} · ${new Date(tx.timestamp).toLocaleDateString()}`
      ).join('\n')
    : '  (no recent transactions)'

  const nftSummary = wallet.nfts.length > 0
    ? `  • ${wallet.nfts.length} NFTs held`
    : '  (no NFTs)'

  const ethImpact = market.portfolioImpact[0]
  const ethImpactLine = ethImpact
    ? `  • ETH: $${ethImpact.holdingUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${ethImpact.percentOfPortfolio.toFixed(1)}% of portfolio) · ${ethImpact.sentiment.toUpperCase()} · ${ethImpact.priceChange24h >= 0 ? '+' : ''}${ethImpact.priceChange24h.toFixed(2)}% (24h) · ${ethImpact.relatedNewsCount} related news`
    : '  • ETH impact data unavailable'

  const relevantNewsSummary = market.relevantNews.length > 0
    ? market.relevantNews
        .slice(0, 5)
        .map((news) =>
          `  • ${news.title} (${news.sentiment}) · ${news.source} · ${news.url}`
        )
        .join('\n')
    : '  (no ETH-specific market headlines right now)'

  return `You are ØRACLE — a sharp, precise on-chain financial AI assistant. You have full access to the user's live wallet data fetched from the blockchain right now.

WALLET DATA (live, fetched this session):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Address: ${wallet.address}${wallet.ensName ? ` (${wallet.ensName})` : ''}
Network: ${wallet.chain}
ETH Balance: ${wallet.ethBalance} ETH ($${wallet.ethBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })})
Total Net Worth: $${wallet.netWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
Risk Level: ${wallet.riskLevel} — ${wallet.riskReason}
Stablecoin Allocation: ${wallet.stablecoinPct.toFixed(1)}%
Top Holding: ${wallet.topHoldingPct.toFixed(1)}% of portfolio

Token Holdings:
${tokenSummary}

Recent Transactions (last 10):
${txSummary}

NFTs:
${nftSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MARKET CONTEXT (ETH-focused, live this session):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fear & Greed Index: ${market.fearGreed.value}/100 (${market.fearGreed.label})
Trend: ${market.fearGreed.trend}

ETH Impact:
${ethImpactLine}

ETH-Relevant News:
${relevantNewsSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSE RULES:
1. Be concise, direct, and insightful. No fluff. No emojis. Do not use markdown formatting symbols like **, __, or bullet markdown syntax.
2. Use real numbers from the wallet data above.
3. For market sentiment questions, start with Fear & Greed, then explain direct ETH impact on this wallet.
4. For news questions, prioritize ETH-relevant news first, then mention broader market only if useful.
4a. Whenever you cite any news item, always include the direct source URL on the same line.
5. If market news materially affects ETH and ETH is a large wallet exposure (>20%), proactively mention that risk.
6. Only call the send_eth tool when the user gives a clear, direct command to send/transfer now with actionable details.
7. If the transfer request is uncertain, hypothetical, or not a direct command (e.g. "might", "maybe", "thinking about"), do NOT call send_eth. Instead, reply in a supportive way like: "Whenever you are ready to transfer funds, you can come back here and Oracle will help you do it safely."
8. Never fabricate data. Only reference what's in the wallet/market context.
9. For "what can you do" — list wallet analysis, ETH market context, risk checks, tx history, and sending ETH.`
}

// ─── Validate transaction intent from tool use ────────────────────────────

function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

function isValidEthAmount(amount: string): boolean {
  const trimmed = amount.trim()
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return false
  const numeric = Number(trimmed)
  return Number.isFinite(numeric) && numeric > 0
}

function parseToolTxIntent(content: unknown[]): SendTxIntent | undefined {
  const toolUse = content.find(
    (block: any) => block?.type === 'tool_use' && block?.name === 'send_eth'
  ) as any
  if (!toolUse?.input || typeof toolUse.input !== 'object') return undefined

  const input = toolUse.input as Record<string, unknown>
  const to = typeof input.to === 'string' ? input.to.trim() : ''
  const amount = typeof input.amount === 'string' ? input.amount.trim() : ''
  const reasonRaw = typeof input.reason === 'string' ? input.reason.trim() : ''

  if (!isValidEthAddress(to) || !isValidEthAmount(amount)) {
    return undefined
  }

  return {
    type: 'SEND_ETH',
    to,
    amount,
    reason: reasonRaw || 'User requested ETH transfer',
  }
}

// ─── Main chat function ──────────────────────────────────────────────────

export async function chat(
  messages: ChatMessage[],
  wallet: WalletData,
  market: MarketContext
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(wallet, market)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    tools: [SEND_ETH_TOOL],
  })

  const content = response.content as Array<{ type: string; text?: string; [key: string]: unknown }>
  const reply = content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
    .trim()

  const txIntent = parseToolTxIntent(content as unknown[])
  const fallbackReply = txIntent
    ? `I can prepare this transfer: send ${txIntent.amount} ETH to ${txIntent.to}. Please confirm before execution.`
    : ''

  return {
    reply: reply || fallbackReply,
    txIntent,
  }
}

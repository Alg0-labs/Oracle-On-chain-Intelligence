import Anthropic from '@anthropic-ai/sdk'
import type { WalletData, ChatMessage, ChatResponse, SendTxIntent } from '../types/index.js'
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

function fmtUsd(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function buildTokenSection(wallet: WalletData): string {
  if (wallet.tokens.length === 0) return '  (none)'
  return wallet.tokens.map(t => {
    const change = t.change24h !== undefined
      ? ` | 24h: ${t.change24h >= 0 ? '+' : ''}${t.change24h.toFixed(2)}%`
      : ''
    const contract = t.contractAddress ? ` | contract: ${t.contractAddress}` : ''
    return `  • ${t.symbol} (${t.name}): balance=${t.balance} | value=${fmtUsd(t.usdValue)}${change}${contract}`
  }).join('\n')
}

function buildTxSection(wallet: WalletData): string {
  if (wallet.transactions.length === 0) return '  (none)'
  return wallet.transactions.map(tx => {
    const date = new Date(tx.timestamp).toISOString().slice(0, 10)
    const fee = tx.feeNativeEth != null
      ? ` | fee: ${tx.feeNativeEth.toFixed(6)} ETH${tx.feeUsd != null ? ` (${fmtUsd(tx.feeUsd)})` : ''}`
      : ''
    const ethVal = parseFloat(tx.value) > 0 ? ` | ETH: ${tx.value} (${fmtUsd(tx.valueUsd)})` : ''
    const gasLine = tx.gasUsed ? ` | gas: ${Number(tx.gasUsed).toLocaleString()}` : ''

    const transferLines = tx.transfers.length > 0
      ? '\n' + tx.transfers.map(tr => {
          const dir = tr.direction === 'out' ? '↑ sent' : '↓ received'
          return `      ${dir} ${tr.amountFormatted} ${tr.symbol} (${tr.name}) | contract: ${tr.tokenAddress} | from: ${tr.from} → to: ${tr.to}`
        }).join('\n')
      : ''

    return [
      `  [${tx.activityType.toUpperCase()}] ${date} | ${tx.status.toUpperCase()} | hash: ${tx.hash}`,
      `    from: ${tx.from} | to: ${tx.to}${ethVal}${fee}${gasLine}`,
      `    ${tx.description}${transferLines}`,
    ].join('\n')
  }).join('\n\n')
}

function buildNftSection(wallet: WalletData): string {
  if (wallet.nfts.length === 0) return '  (none)'
  return wallet.nfts.map(n =>
    `  • ${n.name} | collection: ${n.collection} | tokenId: ${n.tokenId}`
  ).join('\n')
}

function buildSystemPrompt(wallet: WalletData): string {
  return `You are ØRACLE — a sharp, precise on-chain financial AI assistant. You have full real-time access to the user's wallet data fetched this session.

━━━━━━━━━━━━━━━━ WALLET OVERVIEW ━━━━━━━━━━━━━━━━
Address:           ${wallet.address}${wallet.ensName ? ` (${wallet.ensName})` : ''}
Network:           ${wallet.chain}
ETH Balance:       ${wallet.ethBalance} ETH (${fmtUsd(wallet.ethBalanceUsd)})
Total Net Worth:   ${fmtUsd(wallet.netWorthUsd)}
Risk Level:        ${wallet.riskLevel} — ${wallet.riskReason}
Stablecoin Alloc:  ${wallet.stablecoinPct.toFixed(2)}%
Top Holding:       ${wallet.topHoldingPct.toFixed(2)}% of portfolio

━━━━━━━━━━━━━━━━ TOKEN HOLDINGS (${wallet.tokens.length}) ━━━━━━━━━━━━━━━━
${buildTokenSection(wallet)}

━━━━━━━━━━━━━━━━ TRANSACTION HISTORY (${wallet.transactions.length} loaded) ━━━━━━━━━━━━━━━━
${buildTxSection(wallet)}

━━━━━━━━━━━━━━━━ NFTs (${wallet.nfts.length}) ━━━━━━━━━━━━━━━━
${buildNftSection(wallet)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSE RULES:
1. Be concise, direct, and insightful. No fluff. No emojis.
2. Use real numbers from the wallet data above.
3. Only call the send_eth tool when the user gives a clear, direct command to send/transfer now with actionable details.
4. If the transfer request is uncertain, hypothetical, or not a direct command (e.g. "might", "maybe", "thinking about"), do NOT call send_eth. Instead, reply in a supportive way like: "Whenever you are ready to transfer funds, you can come back here and Oracle will help you do it safely."
5. Never fabricate data. Only reference what's in the wallet context.
6. For "what can you do" — list wallet analysis, risk checks, tx history, and sending ETH.`
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
  wallet: WalletData
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(wallet)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
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

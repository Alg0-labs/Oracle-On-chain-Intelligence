import Anthropic from '@anthropic-ai/sdk'
import type { WalletData, ChatMessage, ChatResponse, SendTxIntent } from '../types/index.js'


const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Build system prompt from live wallet data ────────────────────────────

function buildSystemPrompt(wallet: WalletData): string {
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

RESPONSE RULES:
1. Be concise, direct, and insightful. No fluff. No emojis.
2. Use real numbers from the wallet data above.
3. If a user wants to SEND ETH (e.g. "send 0.1 ETH to 0x...", "transfer ETH to..."), you MUST:
   - Confirm the intent clearly
   - End your reply with this exact JSON block on a new line:
   TX_INTENT:{"type":"SEND_ETH","to":"<address>","amount":"<amount in ETH>","reason":"<brief reason>"}
4. Never fabricate data. Only reference what's in the wallet context.
5. For "what can you do" — list wallet analysis, risk checks, tx history, and sending ETH.`
}

// ─── Parse transaction intent from AI reply ──────────────────────────────

function parseTxIntent(reply: string): { clean: string; txIntent?: SendTxIntent } {
  const match = reply.match(/TX_INTENT:(\{[^\n]+\})/)
  if (!match) return { clean: reply }

  try {
    const txIntent = JSON.parse(match[1]) as SendTxIntent
    const clean = reply.replace(/\nTX_INTENT:\{[^\n]+\}/, '').trim()
    return { clean, txIntent }
  } catch {
    return { clean: reply }
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
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const rawReply = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('')

  const { clean, txIntent } = parseTxIntent(rawReply)

  return {
    reply: clean,
    txIntent,
  }
}

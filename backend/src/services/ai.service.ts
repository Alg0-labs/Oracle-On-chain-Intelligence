import Anthropic from '@anthropic-ai/sdk'
import type {
  WalletData,
  ChatMessage,
  ChatResponse,
  SendTxIntent,
  MarketContext,
} from '../types/index.js'
import { isValidEvmAddress, isPositiveDecimal } from '../utils/tx-builder.js'
import { buildSystemPrompt } from '../prompts/system-prompt.js'
import { SEND_ETH_TOOL, SEND_TOKEN_TOOL } from '../prompts/tools.js'
import dotenv from 'dotenv'

dotenv.config({ override: true })

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Parse transaction intent from tool use ───────────────────────────────────

function parseToolTxIntent(content: unknown[]): SendTxIntent | undefined {
  const toolUse = content.find(
    (block: any) =>
      block?.type === 'tool_use' &&
      (block?.name === 'send_eth' || block?.name === 'send_token')
  ) as any

  if (!toolUse?.input || typeof toolUse.input !== 'object') return undefined
  const input = toolUse.input as Record<string, unknown>

  const to     = typeof input.to     === 'string' ? input.to.trim()     : ''
  const amount = typeof input.amount === 'string' ? input.amount.trim() : ''
  const reason = typeof input.reason === 'string' ? input.reason.trim() : ''

  if (!isValidEvmAddress(to) || !isPositiveDecimal(amount)) return undefined

  if (toolUse.name === 'send_token') {
    const tokenAddress = typeof input.tokenAddress === 'string' ? input.tokenAddress.trim() : ''
    const tokenSymbol  = typeof input.tokenSymbol  === 'string' ? input.tokenSymbol.trim()  : '?'
    const tokenName    = typeof input.tokenName    === 'string' ? input.tokenName.trim()    : tokenSymbol
    const decimals     = typeof input.decimals     === 'number' ? input.decimals             : 18
    const chainId      = typeof input.chainId      === 'number' ? input.chainId              : 1

    if (!isValidEvmAddress(tokenAddress)) return undefined

    return {
      type: 'SEND_TOKEN',
      to,
      amount,
      tokenSymbol,
      tokenName,
      tokenAddress,
      decimals,
      chainId,
      reason: reason || `Send ${tokenSymbol} transfer`,
    }
  }

  // send_eth
  const chainId = typeof input.chainId === 'number' ? input.chainId : 1
  return {
    type: 'SEND_ETH',
    to,
    amount,
    chainId,
    reason: reason || 'User requested ETH transfer',
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
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    tools: [SEND_ETH_TOOL, SEND_TOKEN_TOOL],
  })

  const content = response.content as Array<{ type: string; text?: string; [key: string]: unknown }>
  const reply = content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
    .trim()

  const txIntent = parseToolTxIntent(content as unknown[])
  const fallbackReply = txIntent
    ? txIntent.type === 'SEND_TOKEN'
      ? `Ready to send ${txIntent.amount} ${txIntent.tokenSymbol} to ${txIntent.to}. Please confirm.`
      : `Ready to send ${txIntent.amount} ETH to ${txIntent.to}. Please confirm.`
    : ''

  return {
    reply: reply || fallbackReply,
    txIntent,
  }
}

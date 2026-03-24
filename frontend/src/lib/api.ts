import type { WalletData, ChatMessage, SendTxIntent, MarketData } from '../types/index.js'

const BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001') + '/api'

export async function fetchWallet(address: string): Promise<WalletData> {
  const res = await fetch(`${BASE}/wallet/${address}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Failed to fetch wallet')
  return json.wallet
}

export async function sendChat(
  address: string,
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[]
): Promise<{ reply: string; txIntent?: SendTxIntent }> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, messages }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'AI error')
  return { reply: json.reply, txIntent: json.txIntent }
}

export async function fetchMarket(address: string): Promise<MarketData> {
  const res = await fetch(`${BASE}/market/${address}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Failed to fetch market data')
  return {
    fearGreed: json.fearGreed,
    portfolioImpact: json.portfolioImpact ?? [],
    relevantNews: json.relevantNews ?? [],
    latestNewsInsights: json.latestNewsInsights ?? [],
    fetchedAt: json.fetchedAt ?? Date.now(),
  }
}

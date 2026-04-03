import type { WalletData, Transaction, ChatMessage, SendTxIntent, MarketData } from '../types/index.js'

const BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001') + '/api'

export type FetchWalletResult = {
  wallet: WalletData
  snapshotUpdatedAt: string | null
  hydratedFromIndexer?: boolean
}

export async function fetchWallet(address: string): Promise<FetchWalletResult> {
  const res = await fetch(`${BASE}/wallet/${address}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Failed to fetch wallet')
  return {
    wallet: json.wallet,
    snapshotUpdatedAt: json.snapshotUpdatedAt ?? null,
    hydratedFromIndexer: json.hydratedFromIndexer,
  }
}

export async function refreshWallet(address: string): Promise<FetchWalletResult> {
  const res = await fetch(`${BASE}/wallet/${address}/refresh`, { method: 'POST' })
  const json = await res.json()
  if (res.status === 429) {
    throw new Error(`Wait ${Math.ceil((json.retryAfterMs ?? 30000) / 1000)}s before refreshing again`)
  }
  if (!json.success) throw new Error(json.error ?? 'Failed to refresh wallet')
  return {
    wallet: json.wallet,
    snapshotUpdatedAt: json.snapshotUpdatedAt ?? null,
  }
}

export async function fetchTransactions(
  address: string,
  offset?: string,
  limit = 10
): Promise<{ transactions: Transaction[]; nextCursor: string | null; hasMore: boolean }> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (offset) params.set('offset', offset)
  const res = await fetch(`${BASE}/wallet/${address}/transactions?${params}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Failed to fetch transactions')
  return { transactions: json.transactions, nextCursor: json.nextCursor, hasMore: json.hasMore }
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

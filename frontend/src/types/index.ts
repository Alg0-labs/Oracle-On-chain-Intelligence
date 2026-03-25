export interface TokenBalance {
  symbol: string
  name: string
  balance: string
  decimals: number
  usdValue: number
  contractAddress?: string
  logo?: string
  change24h?: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueUsd: number
  timestamp: number
  description: string
  status: 'success' | 'failed'
}

export interface NFT {
  name: string
  collection: string
  tokenId: string
  imageUrl?: string
}

export interface WalletData {
  address: string
  ensName?: string
  ethBalance: string
  ethBalanceUsd: number
  netWorthUsd: number
  tokens: TokenBalance[]
  transactions: Transaction[]
  nfts: NFT[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskReason: string
  topHoldingPct: number
  stablecoinPct: number
  chain: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SendTxIntent {
  type: 'SEND_ETH'
  to: string
  amount: string
  reason: string
}

export interface FearGreedData {
  value: number
  label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
  timestamp: number
  trend: string
  history: Array<{ value: number; timestamp: number }>
}

export interface PortfolioImpact {
  token: 'ETH'
  holdingUsd: number
  percentOfPortfolio: number
  priceChange24h: number
  relatedNewsCount: number
  sentiment: 'bullish' | 'bearish' | 'mixed' | 'neutral'
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  relatedTokens: string[]
  importance: 'high' | 'medium' | 'low'
}

export interface MarketNewsInsight {
  id: string
  title: string
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  aiReasoning: string
  fearGreedConnection: string
  url: string
  source: string
  publishedAt: number
}

export interface MarketData {
  fearGreed: FearGreedData
  portfolioImpact: PortfolioImpact[]
  relevantNews: NewsItem[]
  latestNewsInsights: MarketNewsInsight[]
  fetchedAt: number
}

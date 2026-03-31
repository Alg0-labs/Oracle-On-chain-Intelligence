export interface TokenBalance {
  symbol: string
  name: string
  balance: string
  decimals: number
  usdValue: number
  contractAddress?: string
  logo?: string
  change24h?: number
  chain: string
  chainId?: number
}

export interface NativeBalance {
  chain: string
  chainId: number
  symbol: string
  name: string
  balance: string
  balanceUsd: number
}

export interface ChainBreakdown {
  chain: string
  chainId: number
  usdValue: number
  nativeSymbol: string
}

export type TransactionActivity = 'swap' | 'send' | 'receive' | 'contract'

export interface DecodedTransfer {
  tokenAddress: string
  symbol: string
  name: string
  decimals: number
  logo?: string
  from: string
  to: string
  amountRaw: string
  amountFormatted: string
  direction: 'in' | 'out'
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
  activityType: TransactionActivity
  transfers: DecodedTransfer[]
  feeNativeEth?: number
  feeUsd?: number
  method?: string
  gasUsed?: string
  gasPrice?: string
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
  nativeBalances: NativeBalance[]
  chainBreakdown: ChainBreakdown[]
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

export interface SendEthIntent {
  type: 'SEND_ETH'
  to: string
  amount: string   // human-readable ETH (e.g. "0.1")
  reason: string
  chainId?: number // defaults to 1 (Ethereum mainnet)
}

export interface SendTokenIntent {
  type: 'SEND_TOKEN'
  to: string           // recipient address
  amount: string       // human-readable token amount (e.g. "100")
  tokenSymbol: string
  tokenName: string
  tokenAddress: string // ERC-20 contract address
  decimals: number
  chainId: number
  reason: string
}

export type SendTxIntent = SendEthIntent | SendTokenIntent

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

// ── Trading Copilot Types ─────────────────────────────────────────────────────

export interface MomentumSignal {
  rsi: number
  macd: { value: number; signal: number; histogram: number }
  trend: 'oversold' | 'neutral' | 'overbought'
  priceChange24h: number
  confidence: number
}

export interface SentimentPulse {
  score: number
  fearGreedIndex: number
  fearGreedLabel: string
  trending: boolean
  shift: 'bullish' | 'bearish' | 'neutral'
  confidence: number
}

export interface WhaleActivity {
  volumeAnomaly: number
  direction: 'accumulation' | 'distribution' | 'neutral'
  alert: boolean
  netFlow: 'inflow' | 'outflow' | 'neutral'
  confidence: number
}

export interface NewsImpact {
  hasBreakingNews: boolean
  sentiment: 'positive' | 'negative' | 'neutral'
  importance: 'low' | 'medium' | 'high'
  headlines: string[]
  confidence: number
}

export interface QuickCheckResult {
  sessionId: string
  severity: 'low' | 'medium' | 'high'
  recommendation: 'EXECUTE' | 'CAUTION' | 'AVOID'
  confidence: number
  insights: string[]
  signals: {
    momentum: MomentumSignal
    sentiment: SentimentPulse
    whales: WhaleActivity
    news: NewsImpact
  }
  suggestedActions: Array<{
    label: string
    action: 'execute' | 'wait' | 'limit' | 'analyze'
    params?: Record<string, unknown>
  }>
  executionTimeMs?: number
}

export interface AnalystReport {
  analyst: 'market' | 'sentiment' | 'news' | 'onchain'
  signal: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  keyFindings: string[]
  reasoning: string
}

export interface DebateMessage {
  speaker: 'bull' | 'bear' | 'facilitator'
  round: number
  argument: string
  keyPoints: string[]
}

export interface DeepAnalysisResult {
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  conviction: 'strong' | 'moderate' | 'weak'
  positionSize: number
  entryStrategy: { method: 'market' | 'limit' | 'dca'; targetPrice?: number; dcaSchedule?: string }
  exitStrategy: { targetPrice?: number; stopLoss?: number; trailingStop?: number }
  alternatives: Array<{ action: string; description: string }>
  analystReports: AnalystReport[]
  debate: DebateMessage[]
  risk: {
    riskLevel: 'low' | 'medium' | 'high' | 'extreme'
    maxPositionPct: number
    suggestedPositionPct: number
    stopLossPrice?: number
    takeProfitPrice?: number
    riskRewardRatio?: number
    warnings: string[]
  }
  executionTimeMs: number
}

export type AppMode = 'wallet' | 'trading'

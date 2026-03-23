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
  value: string // in ETH
  valueUsd: number
  timestamp: number
  description: string // human-readable
  gasUsed?: string
  gasPrice?: string
  status: 'success' | 'failed'
  method?: string
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
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  address: string
  messages: ChatMessage[]
  walletData?: WalletData // cached on frontend
}

export interface SendTxIntent {
  type: 'SEND_ETH'
  to: string
  amount: string // in ETH
  reason: string
}

export interface ChatResponse {
  reply: string
  txIntent?: SendTxIntent // if user wants to send funds
}

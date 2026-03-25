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
  value: string // native ETH attached to tx (may be 0 for pure token flows)
  valueUsd: number
  timestamp: number
  description: string
  gasUsed?: string
  gasPrice?: string
  status: 'success' | 'failed'
  method?: string
  /** swap = traded one asset for another; send / receive = one-way flow */
  activityType: TransactionActivity
  /** ERC-20 + native ETH legs (same spirit as decode.js), enriched from token contract */
  transfers: DecodedTransfer[]
  feeNativeEth?: number
  feeUsd?: number
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

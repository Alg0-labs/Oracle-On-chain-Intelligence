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

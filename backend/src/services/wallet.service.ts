import type { WalletData, TokenBalance, Transaction, NFT } from '../types/index.js'
import dotenv from 'dotenv'

dotenv.config()

const MORALIS_API_KEY = process.env.MORALIS_API_KEY ?? ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? ''
const MORALIS_BASE = 'https://deep-index.moralis.io/api/v2.2'

// ─── Moralis helpers ────────────────────────────────────────────────────────

async function moralisFetch(path: string) {
  if (!MORALIS_API_KEY) throw new Error('MORALIS_API_KEY not set')
  const res = await fetch(`${MORALIS_BASE}${path}`, {
    headers: { 'X-API-Key': MORALIS_API_KEY, accept: 'application/json' },
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Moralis ${path}: ${res.status} ${txt}`)
  }
  return res.json()
}

async function etherscanFetch(params: Record<string, string>) {
  if (!ETHERSCAN_API_KEY) throw new Error('ETHERSCAN_API_KEY not set')
  const p = new URLSearchParams({ ...params, apikey: ETHERSCAN_API_KEY })
  const res = await fetch(`https://api.etherscan.io/api?${p}`)
  const json = await res.json()
  if (json.status === '0' && json.message !== 'No transactions found') {
    // non-fatal for empty results
  }
  return json
}

// ─── ETH Price ──────────────────────────────────────────────────────────────

async function getEthPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    const json = await res.json()
    return json?.ethereum?.usd ?? 2500
  } catch {
    return 2500
  }
}

// ─── ENS Name ───────────────────────────────────────────────────────────────

async function getEnsName(address: string): Promise<string | undefined> {
  try {
    const data = await moralisFetch(`/resolve/${address}/reverse`)
    return data?.name
  } catch {
    return undefined
  }
}

// ─── ETH Balance ────────────────────────────────────────────────────────────

async function getEthBalance(address: string): Promise<string> {
  try {
    const data = await moralisFetch(`/${address}/balance`)
    const wei = BigInt(data.balance)
    const eth = Number(wei) / 1e18
    return eth.toFixed(6)
  } catch {
    return '0'
  }
}

// ─── Token Balances ─────────────────────────────────────────────────────────

async function getTokenBalances(address: string): Promise<TokenBalance[]> {
  try {
    const data = await moralisFetch(`/${address}/erc20?chain=eth`)
    const tokens: TokenBalance[] = []

    for (const t of (data as any[]).slice(0, 20)) {
      const decimals = parseInt(t.decimals ?? '18')
      const raw = BigInt(t.balance ?? '0')
      const balance = (Number(raw) / Math.pow(10, decimals)).toFixed(4)
      const usdValue = parseFloat(t.usd_value ?? '0')

      if (usdValue < 0.01) continue // skip dust

      tokens.push({
        symbol: t.symbol ?? 'UNKNOWN',
        name: t.name ?? t.symbol ?? 'Unknown Token',
        balance,
        decimals,
        usdValue,
        contractAddress: t.token_address,
        logo: t.logo,
        change24h: parseFloat(t.usd_price_24hr_percent_change ?? '0'),
      })
    }

    return tokens.sort((a, b) => b.usdValue - a.usdValue)
  } catch {
    return []
  }
}

// ─── Transactions ────────────────────────────────────────────────────────────

function describeTransaction(tx: any, address: string, ethPrice: number): string {
  const addr = address.toLowerCase()
  const isOutgoing = tx.from_address?.toLowerCase() === addr
  const valueEth = (Number(BigInt(tx.value ?? '0')) / 1e18).toFixed(4)
  const valueUsd = (parseFloat(valueEth) * ethPrice).toFixed(2)

  if (tx.input === '0x' || !tx.input) {
    // Simple ETH transfer
    if (isOutgoing) {
      return `Sent ${valueEth} ETH ($${valueUsd}) to ${tx.to_address?.slice(0, 8)}...`
    } else {
      return `Received ${valueEth} ETH ($${valueUsd}) from ${tx.from_address?.slice(0, 8)}...`
    }
  }

  // Check method signature
  const method = tx.decoded_call?.label ?? tx.input?.slice(0, 10)
  if (method?.includes('swap')) return `Swapped tokens via DEX · ${valueEth} ETH`
  if (method?.includes('transfer')) return `Token transfer · contract interaction`
  if (method?.includes('approve')) return `Approved token spending`
  if (method?.includes('stake') || method?.includes('deposit')) return `Staked / deposited funds`
  if (method?.includes('withdraw') || method?.includes('claim')) return `Withdrew / claimed funds`

  return `Contract interaction · ${isOutgoing ? 'out' : 'in'} · ${valueEth} ETH`
}

async function getTransactions(address: string, ethPrice: number): Promise<Transaction[]> {
  try {
    const data = await moralisFetch(
      `/${address}?chain=eth&limit=20&order=DESC`
    )
    const results = data?.result ?? []
    const txs: Transaction[] = []

    for (const tx of results) {
      const valueEth = (Number(BigInt(tx.value ?? '0')) / 1e18)
      txs.push({
        hash: tx.hash,
        from: tx.from_address,
        to: tx.to_address ?? '',
        value: valueEth.toFixed(6),
        valueUsd: valueEth * ethPrice,
        timestamp: new Date(tx.block_timestamp).getTime(),
        description: describeTransaction(tx, address, ethPrice),
        gasUsed: tx.gas,
        gasPrice: tx.gas_price,
        status: tx.receipt_status === '1' ? 'success' : 'failed',
      })
    }

    return txs
  } catch {
    return []
  }
}

// ─── NFTs ────────────────────────────────────────────────────────────────────

async function getNFTs(address: string): Promise<NFT[]> {
  try {
    const data = await moralisFetch(`/${address}/nft?chain=eth&limit=10`)
    const results = data?.result ?? []
    return results.map((n: any) => ({
      name: n.name ?? `#${n.token_id}`,
      collection: n.token_address,
      tokenId: n.token_id,
      imageUrl: n.normalized_metadata?.image,
    }))
  } catch {
    return []
  }
}

// ─── Risk Analysis ───────────────────────────────────────────────────────────

function analyzeRisk(
  tokens: TokenBalance[],
  ethBalance: string,
  ethBalanceUsd: number,
  netWorth: number
): { riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; riskReason: string; topHoldingPct: number; stablecoinPct: number } {
  const stableSymbols = ['USDC', 'USDT', 'DAI', 'BUSD', 'FRAX', 'LUSD', 'UST']
  
  const allAssets = [
    { symbol: 'ETH', usdValue: ethBalanceUsd },
    ...tokens,
  ]

  const totalUsd = allAssets.reduce((s, a) => s + a.usdValue, 0) || 1

  const stablecoinUsd = allAssets
    .filter(a => stableSymbols.includes(a.symbol.toUpperCase()))
    .reduce((s, a) => s + a.usdValue, 0)

  const stablecoinPct = (stablecoinUsd / totalUsd) * 100
  const topHolding = allAssets.reduce((m, a) => a.usdValue > m.usdValue ? a : m, allAssets[0] ?? { usdValue: 0, symbol: 'ETH' })
  const topHoldingPct = ((topHolding?.usdValue ?? 0) / totalUsd) * 100

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  let riskReason = 'Diversified portfolio with reasonable stablecoin allocation.'

  if (topHoldingPct > 80) {
    riskLevel = 'HIGH'
    riskReason = `${topHolding?.symbol ?? 'One asset'} makes up ${topHoldingPct.toFixed(0)}% of portfolio — extreme concentration risk.`
  } else if (topHoldingPct > 60) {
    riskLevel = 'MEDIUM'
    riskReason = `${topHolding?.symbol ?? 'One asset'} is ${topHoldingPct.toFixed(0)}% of portfolio — moderate concentration risk.`
  } else if (stablecoinPct < 5 && netWorth > 5000) {
    riskLevel = 'MEDIUM'
    riskReason = 'Very low stablecoin allocation — limited downside protection.'
  }

  return { riskLevel, riskReason, topHoldingPct, stablecoinPct }
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function fetchWalletData(address: string): Promise<WalletData> {
  const [ethPrice, ensName, ethBalanceStr] = await Promise.all([
    getEthPrice(),
    getEnsName(address),
    getEthBalance(address),
  ])

  const ethBalance = parseFloat(ethBalanceStr)
  const ethBalanceUsd = ethBalance * ethPrice

  const [tokens, transactions, nfts] = await Promise.all([
    getTokenBalances(address),
    getTransactions(address, ethPrice),
    getNFTs(address),
  ])

  const tokenNetWorth = tokens.reduce((s, t) => s + t.usdValue, 0)
  const netWorthUsd = ethBalanceUsd + tokenNetWorth

  const { riskLevel, riskReason, topHoldingPct, stablecoinPct } = analyzeRisk(
    tokens, ethBalanceStr, ethBalanceUsd, netWorthUsd
  )

  return {
    address,
    ensName,
    ethBalance: ethBalanceStr,
    ethBalanceUsd,
    netWorthUsd,
    tokens,
    transactions,
    nfts,
    riskLevel,
    riskReason,
    topHoldingPct,
    stablecoinPct,
    chain: 'Ethereum',
  }
}

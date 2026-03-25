import type { WalletData, TokenBalance, Transaction, NFT } from '../types/index.js'
import {
  attachTokenMeta,
  buildTransactionDescription,
  classifyActivity,
  collectRawTransferLegs,
  computeFeeEthAndUsd,
  parseWeiField,
  type TokenMeta,
} from '../utils/transaction-decode.js'
import { formatEther, getAddress } from 'viem'
import dotenv from 'dotenv'

dotenv.config()

const MORALIS_API_KEY = process.env.MORALIS_API_KEY ?? ''
const DUNE_SIM_API_KEY = process.env.DUNE_SIM_API_KEY ?? ''
const MORALIS_BASE = 'https://deep-index.moralis.io/api/v2.2'
const DUNE_SIM_BASE = 'https://api.sim.dune.com/v1/evm'

const NATIVE_ETH_PLACEHOLDER = '0x0000000000000000000000000000000000000000' as const

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ─── Moralis helpers (balance, tokens, NFTs, metadata) ──────────────────────

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

// ─── Dune SIM helpers (transactions) ────────────────────────────────────────

async function duneFetch(path: string): Promise<any> {
  if (!DUNE_SIM_API_KEY) throw new Error('DUNE_SIM_API_KEY not set')
  const res = await fetch(`${DUNE_SIM_BASE}${path}`, {
    headers: { 'X-Sim-Api-Key': DUNE_SIM_API_KEY, accept: 'application/json' },
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Dune SIM ${path}: ${res.status} ${txt}`)
  }
  return res.json()
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

// ─── Transactions (decode via ../utils/transaction-decode.ts) ─────────────────

async function fetchTokenMetadataMap(addresses: string[]): Promise<Map<string, TokenMeta>> {
  const map = new Map<string, TokenMeta>()
  if (addresses.length === 0) return map

  for (const group of chunk(addresses, 20)) {
    const params = new URLSearchParams({ chain: 'eth' })
    let appended = 0
    for (const a of group) {
      try {
        params.append('addresses', getAddress(a as `0x${string}`))
        appended++
      } catch {
        continue
      }
    }
    if (appended === 0) continue

    try {
      const data = await moralisFetch(`/erc20/metadata?${params.toString()}`)
      const arr = Array.isArray(data) ? data : []
      for (const t of arr) {
        const addr = (t.token_address ?? t.address ?? '') as string
        if (!addr) continue
        const key = addr.toLowerCase()
        map.set(key, {
          symbol: (t.symbol as string) ?? '?',
          name: (t.name as string) ?? (t.symbol as string) ?? 'Unknown',
          decimals: parseInt(String(t.decimals ?? '18'), 10) || 18,
          logo: t.logo as string | undefined,
        })
      }
    } catch {
      /* non-fatal */
    }
  }
  return map
}

/**
 * Build a normalised Transaction from a Dune SIM transaction row.
 * Dune fields: from, to, data (calldata), value (hex), gas_used (hex),
 * gas_price (hex), effective_gas_price (hex), success (bool), block_time (ISO).
 * Logs are already embedded: [{ address, data, topics[] }]
 */
function buildTransactionFromDune(
  row: any,
  walletLower: string,
  ethPrice: number,
  metaMap: Map<string, TokenMeta>
): Transaction {
  const tx = row as Record<string, unknown>

  const hash = tx.hash as string
  const from = (tx.from as string) ?? ''
  const to = (tx.to as string) ?? ''
  const fromL = from.toLowerCase()
  const toL = to.toLowerCase()

  const valueWei = parseWeiField(tx.value)
  const valueEth = Number(valueWei) / 1e18

  // Dune logs are already clean — normalizeTxLogs picks them up via `tx.logs`
  const rawTokenLegs = collectRawTransferLegs(tx, walletLower)
  const transfers = rawTokenLegs.map((r) => attachTokenMeta(r, metaMap))

  if (valueWei > 0n) {
    const direction: 'in' | 'out' = fromL === walletLower ? 'out' : toL === walletLower ? 'in' : 'out'
    transfers.unshift({
      tokenAddress: getAddress(NATIVE_ETH_PLACEHOLDER),
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      from,
      to,
      amountRaw: valueWei.toString(),
      amountFormatted: formatEther(valueWei),
      direction,
    })
  }

  const activityType = classifyActivity(transfers, tx)
  const { feeNativeEth, feeUsd } = computeFeeEthAndUsd(tx, tx, ethPrice)
  const description = buildTransactionDescription(activityType, transfers, feeNativeEth, feeUsd)

  const ts = tx.block_time as string | undefined
  const timestamp = ts ? new Date(ts).getTime() : Date.now()

  const status: 'success' | 'failed' = tx.success === true ? 'success' : 'failed'

  // Dune: gas_used / gas_price are hex strings — convert to decimal strings for display
  const gasUsedBig = parseWeiField(tx.gas_used)
  const gasPriceBig = parseWeiField(tx.gas_price)

  return {
    hash,
    from,
    to,
    value: valueEth.toFixed(6),
    valueUsd: valueEth * ethPrice,
    timestamp,
    description,
    gasUsed: gasUsedBig > 0n ? gasUsedBig.toString() : undefined,
    gasPrice: gasPriceBig > 0n ? gasPriceBig.toString() : undefined,
    status,
    method: undefined,
    activityType,
    transfers,
    feeNativeEth,
    feeUsd,
  }
}

async function decodeDuneTxBatch(
  rows: any[],
  walletLower: string,
  ethPrice: number
): Promise<Transaction[]> {
  if (rows.length === 0) return []

  // Dune already embeds logs in each row — no per-tx verbose fetch needed.
  const tokenAddrs = new Set<string>()
  for (const row of rows) {
    for (const leg of collectRawTransferLegs(row as Record<string, unknown>, walletLower)) {
      tokenAddrs.add(leg.tokenAddress.toLowerCase())
    }
  }

  const metaMap = await fetchTokenMetadataMap([...tokenAddrs])
  return rows.map((row) => buildTransactionFromDune(row, walletLower, ethPrice, metaMap))
}

async function getTransactions(address: string, ethPrice: number): Promise<Transaction[]> {
  try {
    const qs = new URLSearchParams({ limit: '20', decode: 'false' })
    const data = await duneFetch(`/transactions/${address}?${qs}`)
    const rows = (data?.transactions ?? []) as any[]
    return decodeDuneTxBatch(rows, address.toLowerCase(), ethPrice)
  } catch (err: any) {
    console.error('[getTransactions]', err.message)
    return []
  }
}

export async function getTransactionsPaged(
  address: string,
  ethPrice: number,
  offset?: string,
  limit = 10
): Promise<{ transactions: Transaction[]; nextCursor: string | null; hasMore: boolean }> {
  const qs = new URLSearchParams({ limit: String(limit), decode: 'false' })
  if (offset) qs.set('offset', offset)

  const data = await duneFetch(`/transactions/${address}?${qs}`)
  const rows = (data?.transactions ?? []) as any[]
  const nextCursor = (data?.next_offset as string | undefined) ?? null
  const hasMore = Boolean(nextCursor && rows.length === limit)

  const transactions = await decodeDuneTxBatch(rows, address.toLowerCase(), ethPrice)
  return { transactions, nextCursor, hasMore }
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

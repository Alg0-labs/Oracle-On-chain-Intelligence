import type { WalletData, MarketData } from '../types/index.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA', WETH: '#627EEA', BTC: '#F7931A', WBTC: '#F7931A',
  USDC: '#2775CA', USDT: '#26A17B', DAI: '#F5AC37', ARB: '#12AAFF',
  OP: '#FF0420', MATIC: '#8247E5', POL: '#8247E5', LINK: '#375BD2',
  UNI: '#FF007A', AAVE: '#B6509E', MKR: '#1AAB9B', SNX: '#00D1FF',
}
const CHAIN_COLORS: Record<string, string> = {
  Ethereum: '#627EEA', Polygon: '#8247E5', BSC: '#F3BA2F',
  Arbitrum: '#12AAFF', Optimism: '#FF0420', Base: '#0052FF',
  Avalanche: '#E84142', zkSync: '#8C8DFC',
}

function tokenColor(sym: string)  { return TOKEN_COLORS[sym.toUpperCase()] ?? '#6366F1' }
function chainColor(chain: string){ return CHAIN_COLORS[chain] ?? '#6366F1' }
function riskColor(r: string)     { return r === 'LOW' ? '#22C55E' : r === 'HIGH' ? '#EF4444' : '#F59E0B' }

function fmt$(n: number, decimals = 2) {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function timeAgo(isoOrSeconds: string | number): string {
  const ms   = typeof isoOrSeconds === 'number' ? isoOrSeconds * 1000 : new Date(isoOrSeconds).getTime()
  const diff = (Date.now() - ms) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function txColor(type: string) {
  switch (type) {
    case 'receive': return { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   bd: 'rgba(34,197,94,0.2)' }
    case 'send':    return { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   bd: 'rgba(239,68,68,0.2)' }
    case 'swap':    return { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', bd: 'rgba(245,158,11,0.2)' }
    default:        return { color: '#71717A', bg: 'rgba(113,113,122,0.06)', bd: 'rgba(113,113,122,0.15)' }
  }
}

// ── Donut chart ───────────────────────────────────────────────────────────────

interface DonutSlice { label: string; value: number; color: string }

function DonutChart({ slices, size = 120, thickness = 18 }: { slices: DonutSlice[]; size?: number; thickness?: number }) {
  const total  = slices.reduce((a, s) => a + s.value, 0) || 1
  const r      = (size - thickness) / 2
  const cx     = size / 2
  const cy     = size / 2
  const circum = 2 * Math.PI * r

  let offset = 0
  const paths = slices.map(s => {
    const pct  = s.value / total
    const dash = pct * circum
    const gap  = circum - dash
    const el   = (
      <circle
        key={s.label}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={s.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
    offset += dash
    return el
  })

  const topSlice = slices[0]

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        {paths}
      </svg>
      {/* Center label */}
      {topSlice && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 9, color: 'var(--text-5)', fontWeight: 600, letterSpacing: '0.06em' }}>TOP</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: topSlice.color, lineHeight: 1, marginTop: 1 }}>
            {((topSlice.value / total) * 100).toFixed(0)}%
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-4)', marginTop: 2 }}>{topSlice.label}</span>
        </div>
      )}
    </div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ values, color, width = 60, height = 20 }: { values: number[]; color: string; width?: number; height?: number }) {
  if (values.length < 2) return null
  const min   = Math.min(...values)
  const max   = Math.max(...values)
  const range = max - min || 1
  const pts   = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── Portfolio Health Score ────────────────────────────────────────────────────

function healthScore(wallet: WalletData): { score: number; label: string; color: string } {
  let score = 70
  if (wallet.riskLevel === 'LOW')    score += 20
  if (wallet.riskLevel === 'HIGH')   score -= 25
  if (wallet.stablecoinPct > 10)     score += 5
  if (wallet.stablecoinPct > 25)     score += 5
  if (wallet.topHoldingPct > 80)     score -= 15
  if (wallet.topHoldingPct > 90)     score -= 10
  if ((wallet.chainBreakdown ?? []).length > 2) score += 5
  if (wallet.nfts?.length > 0)       score += 5
  score = Math.max(0, Math.min(100, score))
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#84CC16' : score >= 40 ? '#F59E0B' : '#EF4444'
  return { score, label, color }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  wallet: WalletData
  market: MarketData | null
  snapshotUpdatedAt: string | null
  refreshing: boolean
  onRefresh: () => void
  refreshError: string | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OverviewPanel({ wallet, market, snapshotUpdatedAt, refreshing, onRefresh, refreshError }: Props) {
  const breakdown  = wallet.chainBreakdown ?? []
  const topTokens  = wallet.tokens.slice(0, 5)
  const recentTxs  = wallet.transactions.slice(0, 6)
  const tokenValue = Math.max(0, wallet.netWorthUsd - wallet.ethBalanceUsd)
  const health     = healthScore(wallet)
  const fg         = market?.fearGreed

  // Donut slices from chain breakdown
  const donutSlices: DonutSlice[] = breakdown.length > 0
    ? breakdown.slice(0, 6).map(c => ({ label: c.chain, value: c.usdValue, color: chainColor(c.chain) }))
    : [{ label: 'ETH', value: 1, color: '#627EEA' }]

  // Sparkline from fear/greed history
  const fgHistory = fg?.history?.slice(-10).map(h => h.value) ?? []

  return (
    <div style={panel}>

      {/* ── Page header ── */}
      <header style={pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={pageTitle}>Overview</h1>
          {wallet.ensName && (
            <span style={ensPill}>{wallet.ensName}</span>
          )}
        </div>
      </header>

      {/* ── Scrollable body ── */}
      <div style={body}>

        {/* ── ROW 1: Primary stat cards ── */}
        <div style={statGrid}>

          {/* Net Worth */}
          <div style={{ ...card, gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={lbl}>TOTAL NET WORTH</div>
                <div style={{ ...bigNum, fontSize: 32, marginTop: 6 }}>{fmt$(wallet.netWorthUsd)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ ...chainBadge, background: `${riskColor(wallet.riskLevel)}12`, color: riskColor(wallet.riskLevel), borderColor: `${riskColor(wallet.riskLevel)}30` }}>
                    ● {wallet.riskLevel} RISK
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                    {(wallet.chainBreakdown ?? []).length} chains · {wallet.tokens.length} tokens
                    {wallet.nfts?.length > 0 && ` · ${wallet.nfts.length} NFTs`}
                  </span>
                </div>
              </div>
              {/* Portfolio donut */}
              <DonutChart slices={donutSlices} size={100} thickness={14} />
            </div>
          </div>

          {/* ETH Balance */}
          <div style={card}>
            <div style={lbl}>NATIVE BALANCE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ ...tokenDot, background: '#627EEA20', color: '#627EEA', borderColor: '#627EEA30' }}>E</div>
              <div>
                <div style={midNum}>{parseFloat(wallet.ethBalance).toFixed(4)} ETH</div>
                <div style={sub}>{fmt$(wallet.ethBalanceUsd)}</div>
              </div>
            </div>
          </div>

          {/* ERC-20 Tokens */}
          <div style={card}>
            <div style={lbl}>ERC-20 TOKENS</div>
            <div style={{ ...midNum, marginTop: 8 }}>{wallet.tokens.length}</div>
            <div style={sub}>{fmt$(tokenValue)} total value</div>
          </div>

        </div>

        {/* ── ROW 2: Web3 health metrics ── */}
        <div style={healthGrid}>

          {/* Portfolio Health */}
          <div style={card}>
            <div style={lbl}>PORTFOLIO HEALTH</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span style={{ ...bigNum, fontSize: 22, color: health.color }}>{health.score}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: health.color }}>{health.label}</span>
            </div>
            {/* Score bar */}
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${health.score}%`, background: health.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ ...sub, marginTop: 6 }}>{wallet.riskReason}</div>
          </div>

          {/* Stablecoin Allocation */}
          <div style={card}>
            <div style={lbl}>STABLECOIN ALLOCATION</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span style={{ ...bigNum, fontSize: 22 }}>{wallet.stablecoinPct?.toFixed(1) ?? '0.0'}%</span>
              <span style={{ fontSize: 11, color: wallet.stablecoinPct > 10 ? '#22C55E' : '#F59E0B' }}>
                {wallet.stablecoinPct > 20 ? '↑ Conservative' : wallet.stablecoinPct > 10 ? '✓ Healthy' : '⚠ Low'}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(wallet.stablecoinPct ?? 0, 100)}%`, background: '#2775CA', borderRadius: 2 }} />
            </div>
            <div style={{ ...sub, marginTop: 6 }}>Target: 10–25% for active traders</div>
          </div>

          {/* Top Holding Concentration */}
          <div style={card}>
            <div style={lbl}>CONCENTRATION RISK</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span style={{ ...bigNum, fontSize: 22, color: (wallet.topHoldingPct ?? 0) > 80 ? '#F59E0B' : 'var(--text)' }}>
                {wallet.topHoldingPct?.toFixed(1) ?? '—'}%
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(wallet.topHoldingPct ?? 0, 100)}%`,
                background: (wallet.topHoldingPct ?? 0) > 80 ? '#F59E0B' : '#22C55E',
                borderRadius: 2,
              }} />
            </div>
            <div style={{ ...sub, marginTop: 6 }}>
              {wallet.tokens[0] ? `Top: ${wallet.tokens[0].symbol}` : 'ETH'} · {(wallet.topHoldingPct ?? 0) > 80 ? 'High exposure' : 'Well spread'}
            </div>
          </div>

          {/* Market Sentiment / Fear & Greed */}
          <div style={card}>
            <div style={lbl}>MARKET SENTIMENT</div>
            {fg ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <span style={{
                    ...bigNum, fontSize: 22,
                    color: fg.value < 30 ? '#EF4444' : fg.value > 70 ? '#22C55E' : '#F59E0B',
                  }}>
                    {fg.value}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: fg.value < 30 ? '#EF4444' : fg.value > 70 ? '#22C55E' : '#F59E0B' }}>
                      {fg.label}
                    </div>
                    {fgHistory.length > 1 && (
                      <Sparkline
                        values={fgHistory}
                        color={fg.value < 30 ? '#EF4444' : fg.value > 70 ? '#22C55E' : '#F59E0B'}
                        width={50} height={16}
                      />
                    )}
                  </div>
                </div>
                <div style={{ ...sub, marginTop: 6 }}>{fg.trend}</div>
              </>
            ) : (
              <div style={{ ...sub, marginTop: 8 }}>Market data unavailable</div>
            )}
          </div>

        </div>

        {/* ── ROW 3: Chain breakdown + Top holdings ── */}
        <div style={twoCol}>

          {/* Chain Breakdown */}
          <div style={card}>
            <div style={cardHead}>
              <span style={cardTitle}>Chain Breakdown</span>
              <span style={cardMeta}>{breakdown.length} networks</span>
            </div>

            {breakdown.length > 0 ? (
              <div>
                {/* Stacked bar */}
                <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', marginBottom: 16, gap: 1 }}>
                  {breakdown.map(c => (
                    <div
                      key={c.chain}
                      title={`${c.chain}: ${fmt$(c.usdValue)}`}
                      style={{
                        height: '100%',
                        width: `${(c.usdValue / (wallet.netWorthUsd || 1)) * 100}%`,
                        background: chainColor(c.chain),
                        minWidth: 2,
                      }}
                    />
                  ))}
                </div>

                {breakdown.map((c, i) => (
                  <div key={c.chain} style={{ ...barRow, borderBottom: i < breakdown.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: chainColor(c.chain), flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{c.chain}</span>
                    </div>
                    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', margin: '0 12px' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.max((c.usdValue / (wallet.netWorthUsd || 1)) * 100, 1)}%`,
                        background: chainColor(c.chain),
                        borderRadius: 2,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-4)', minWidth: 36 }}>
                        {((c.usdValue / (wallet.netWorthUsd || 1)) * 100).toFixed(1)}%
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', minWidth: 72, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt$(c.usdValue, 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyMsg}>No chain breakdown available</p>
            )}
          </div>

          {/* Top Holdings */}
          <div style={card}>
            <div style={cardHead}>
              <span style={cardTitle}>Top Holdings</span>
              <span style={cardMeta}>{wallet.tokens.length + (wallet.nativeBalances?.length ?? 0)} assets total</span>
            </div>

            {topTokens.length > 0 ? topTokens.map((t, i) => {
              const pct = wallet.netWorthUsd > 0 ? (t.usdValue / wallet.netWorthUsd) * 100 : 0
              return (
                <div key={`${t.symbol}-${i}`} style={{ ...holdingRow, borderBottom: i < topTokens.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ ...tokenDot, background: `${tokenColor(t.symbol)}18`, color: tokenColor(t.symbol), borderColor: `${tokenColor(t.symbol)}30` }}>
                    {t.symbol.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.symbol}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                    </div>
                    {/* Mini allocation bar */}
                    <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: tokenColor(t.symbol), borderRadius: 1 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt$(t.usdValue, 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-5)' }}>{pct.toFixed(1)}%</span>
                      {t.change24h != null && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: t.change24h >= 0 ? '#22C55E' : '#EF4444' }}>
                          {t.change24h >= 0 ? '▲' : '▼'}{Math.abs(t.change24h).toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            }) : (
              <p style={emptyMsg}>No ERC-20 tokens found</p>
            )}

            {/* NFT count if any */}
            {wallet.nfts?.length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-glow)', border: '1px solid var(--accent-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                    🖼
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>NFT Collection</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{wallet.nfts.length} NFTs across collections</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── ROW 4: Recent Transactions ── */}
        <div style={card}>
          <div style={cardHead}>
            <span style={cardTitle}>Recent Transactions</span>
            <span style={cardMeta}>{wallet.transactions.length} loaded</span>
          </div>

          {recentTxs.length > 0 ? (
            <div>
              {recentTxs.map((tx, i) => {
                const ac = txColor(tx.activityType)
                return (
                  <div key={tx.hash} style={{ ...txRow, borderBottom: i < recentTxs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ ...typePill, color: ac.color, background: ac.bg, borderColor: ac.bd }}>
                        {tx.activityType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {tx.description}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: tx.activityType === 'receive' ? '#22C55E' : tx.activityType === 'send' ? '#EF4444' : 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                        {tx.valueUsd > 0 ? `${tx.activityType === 'receive' ? '+' : tx.activityType === 'send' ? '−' : ''}${fmt$(tx.valueUsd)}` : '—'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-5)', minWidth: 52, textAlign: 'right' }}>
                        {timeAgo(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ ...emptyMsg, padding: '20px 0' }}>No recent transactions</p>
          )}
        </div>

        {/* ── ROW 5: Market snapshot strip (if available) ── */}
        {market && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

            {/* Fear & Greed */}
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: fg && fg.value > 70 ? 'rgba(34,197,94,0.1)' : fg && fg.value < 30 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                {fg && fg.value > 70 ? '🟢' : fg && fg.value < 30 ? '🔴' : '🟡'}
              </div>
              <div>
                <div style={lbl}>FEAR & GREED</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: fg && fg.value > 70 ? '#22C55E' : fg && fg.value < 30 ? '#EF4444' : '#F59E0B', marginTop: 2 }}>
                  {fg ? `${fg.value} · ${fg.label}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Portfolio sentiment */}
            {market.portfolioImpact[0] && (
              <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: market.portfolioImpact[0].sentiment === 'bullish' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>
                  {market.portfolioImpact[0].sentiment === 'bullish' ? '📈' : '📉'}
                </div>
                <div>
                  <div style={lbl}>ETH SENTIMENT</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: market.portfolioImpact[0].sentiment === 'bullish' ? '#22C55E' : '#EF4444', marginTop: 2 }}>
                    {market.portfolioImpact[0].sentiment.toUpperCase()}
                  </div>
                </div>
              </div>
            )}

            {/* Top news */}
            {market.relevantNews[0] && (
              <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={lbl}>LATEST INTEL</div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                  {market.relevantNews[0].title}
                </p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: market.relevantNews[0].sentiment === 'bullish' ? '#22C55E' : market.relevantNews[0].sentiment === 'bearish' ? '#EF4444' : '#F59E0B' }}>
                    {market.relevantNews[0].sentiment.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-5)' }}>· {market.relevantNews[0].source}</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

// ── Styles (all CSS-var-aware for light/dark) ─────────────────────────────────

const panel: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
  background: 'var(--bg)',
}

const pageHeader: React.CSSProperties = {
  height: 52, flexShrink: 0,
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 24px',
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const pageTitle: React.CSSProperties = {
  fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em',
}

const ensPill: React.CSSProperties = {
  fontSize: 11, color: 'var(--accent)', background: 'var(--accent-glow)',
  border: '1px solid var(--accent-bd)', borderRadius: 999, padding: '2px 10px',
}

const syncLbl: React.CSSProperties = { fontSize: 11, color: 'var(--text-5)' }

const refreshBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text-4)', fontSize: 12,
  padding: '5px 12px', cursor: 'pointer',
  transition: 'border-color 0.15s, color 0.15s',
}

const body: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: 20,
  display: 'flex', flexDirection: 'column', gap: 12,
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 8, padding: 18,
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const statGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
}

const healthGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
}

const twoCol: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
}

const lbl: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: 'var(--text-5)', letterSpacing: '0.1em',
}

const bigNum: React.CSSProperties = {
  fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em',
  fontVariantNumeric: 'tabular-nums',
}

const midNum: React.CSSProperties = {
  fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
}

const sub: React.CSSProperties = { fontSize: 11, color: 'var(--text-4)', marginTop: 2 }

const cardHead: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
}

const cardTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em',
}

const cardMeta: React.CSSProperties = { fontSize: 11, color: 'var(--text-5)' }

const barRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', padding: '8px 0',
}

const holdingRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
}

const tokenDot: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 7, border: '1px solid',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 10, fontWeight: 700, flexShrink: 0,
}

const chainBadge: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
  border: '1px solid', borderRadius: 999, padding: '2px 8px',
}

const txRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 12, padding: '10px 0',
}

const typePill: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
  padding: '3px 7px', borderRadius: 999, border: '1px solid', flexShrink: 0,
}

const emptyMsg: React.CSSProperties = {
  fontSize: 12, color: 'var(--text-5)', textAlign: 'center', padding: '10px 0',
}

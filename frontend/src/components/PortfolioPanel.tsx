import type { WalletData, MarketData, MarketNewsInsight } from '../types/index.js'

function Sparkline({ positive }: { positive: boolean }) {
  const points = positive
    ? '0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,4 64,2'
    : '0,4 8,6 16,4 24,10 32,8 40,14 48,12 56,16 64,18'
  return (
    <svg width="64" height="20" viewBox="0 0 64 20">
      <polyline points={points} fill="none" stroke={positive ? '#4ADE80' : '#F87171'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}

const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA', WETH: '#627EEA',
  BTC: '#F7931A', WBTC: '#F7931A',
  USDC: '#2775CA', USDT: '#26A17B', DAI: '#F5AC37',
  SOL: '#9945FF', ARB: '#12AAFF', OP: '#FF0420',
  MATIC: '#8247E5', LINK: '#375BD2', UNI: '#FF007A',
  AAVE: '#B6509E', MKR: '#1AAB9B',
}
function tokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol.toUpperCase()] ?? '#6366F1'
}

interface Props {
  wallet: WalletData
  market: MarketData | null
}

export function PortfolioPanel({ wallet, market }: Props) {
  const allAssets = [
    { symbol: 'ETH', name: 'Ethereum', usdValue: wallet.ethBalanceUsd, balance: wallet.ethBalance, change24h: undefined as number | undefined },
    ...wallet.tokens,
  ]
  const total = allAssets.reduce((s, a) => s + a.usdValue, 0) || 1

  return (
    <div style={panel}>
      {/* Holdings */}
      <div style={sectionTitle}>HOLDINGS</div>
      {allAssets.map((t) => {
        const pct = ((t.usdValue / total) * 100).toFixed(1)
        return (
          <div key={t.symbol} style={tokenRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: tokenColor(t.symbol) }} />
              <div>
                <div style={symStyle}>{t.symbol}</div>
                <div style={nameStyle}>{t.name}</div>
              </div>
            </div>
            <Sparkline positive={(t.change24h ?? 0) >= 0} />
            <div style={{ textAlign: 'right' }}>
              <div style={valStyle}>${t.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              {t.change24h !== undefined && (
                <div style={{ fontSize: 11, color: t.change24h >= 0 ? '#4ADE80' : '#F87171' }}>
                  {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(1)}%
                </div>
              )}
            </div>
            <div style={pctStyle}>{pct}%</div>
          </div>
        )
      })}

      {/* Allocation bar */}
      <div style={sectionTitle}>ALLOCATION</div>
      <div style={allocBar}>
        {allAssets.map(t => (
          <div key={t.symbol}
            style={{ width: `${(t.usdValue / total) * 100}%`, background: tokenColor(t.symbol), height: '100%', transition: 'width 0.8s ease' }}
            title={`${t.symbol} ${((t.usdValue / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
        {allAssets.map(t => (
          <div key={t.symbol} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: tokenColor(t.symbol) }} />
            <span style={{ color: '#888', fontSize: 11, fontFamily: 'monospace' }}>{t.symbol}</span>
          </div>
        ))}
      </div>

      {/* Risk */}
      <div style={sectionTitle}>RISK ANALYSIS</div>
      <div style={riskBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ color: '#888', fontSize: 11 }}>RISK LEVEL</span>
          <RiskBadge level={wallet.riskLevel} />
        </div>
        <p style={{ color: '#A0A0A0', fontSize: 12, margin: 0, lineHeight: 1.7 }}>{wallet.riskReason}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 20 }}>
          <Metric label="Stablecoin" value={`${wallet.stablecoinPct.toFixed(1)}%`} />
          <Metric label="Top Holding" value={`${wallet.topHoldingPct.toFixed(1)}%`} />
        </div>
      </div>

      {/* NFTs */}
      {wallet.nfts.length > 0 && (
        <>
          <div style={sectionTitle}>NFTs</div>
          <div style={{ color: '#888', fontSize: 12 }}>{wallet.nfts.length} NFTs held</div>
        </>
      )}

      {/* Recent Transactions */}
      <div style={sectionTitle}>RECENT ACTIVITY</div>
      {wallet.transactions.slice(0, 8).map((tx) => (
        <div key={tx.hash} style={actRow}>
          <span style={{ color: tx.status === 'success' ? '#6366F1' : '#F87171', fontSize: 8 }}>◆</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#C0C0B8', fontSize: 12 }}>{tx.description}</div>
            <div style={{ color: '#444', fontSize: 10, marginTop: 2 }}>
              {new Date(tx.timestamp).toLocaleDateString()} · {tx.hash.slice(0, 10)}...
            </div>
          </div>
          <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{ color: '#444', fontSize: 10, textDecoration: 'none' }}>↗</a>
        </div>
      ))}

      {/* Market Intelligence */}
      {!market ? (
        <div style={{ color: '#666', fontSize: 12 }}>Loading market intelligence...</div>
      ) : (
        <>
          <div style={sectionTitle}>FEAR & GREED INDEX</div>
          <FearGreedGauge value={market.fearGreed.value} label={market.fearGreed.label} />
          <div style={{ ...sectionTitle, marginTop: 16 }}>LATEST MARKET NEWS (TOP 10)</div>
          {(market.latestNewsInsights ?? []).slice(0, 10).map((item) => (
            <NewsInsightCard key={item.id} item={item} />
          ))}
        </>
      )}
    </div>
  )
}

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  const angle = -120 + (clamped / 100) * 240
  const radians = (angle * Math.PI) / 180
  const radius = 46
  const cx = 62
  const cy = 62
  const x = cx + radius * Math.cos(radians)
  const y = cy + radius * Math.sin(radians)

  return (
    <div style={gaugeCard}>
      <div style={{ color: '#C9C9C2', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Crypto Fear and Greed Index</div>
      <svg width="124" height="86" viewBox="0 0 124 86">
        <path d="M16 62 A46 46 0 0 1 39 22" stroke="#E55B63" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M39 22 A46 46 0 0 1 62 16" stroke="#DCA84A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M62 16 A46 46 0 0 1 85 22" stroke="#C2C842" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M85 22 A46 46 0 0 1 108 62" stroke="#3FC09A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#DADAD5" strokeWidth="3" />
        <circle cx={cx} cy={cy} r="6" fill="#B8B8B0" />
      </svg>
      <div style={{ marginTop: -2, textAlign: 'center' }}>
        <div style={{ color: '#E8E8E0', fontSize: 38, fontWeight: 700, lineHeight: 1 }}>{clamped}</div>
        <div style={{ color: '#9A9A93', fontSize: 14 }}>{label}</div>
      </div>
    </div>
  )
}

function NewsInsightCard({ item }: { item: MarketNewsInsight }) {
  const sentimentColor =
    item.sentiment === 'bullish'
      ? '#4ADE80'
      : item.sentiment === 'bearish'
        ? '#F87171'
        : '#A3A3A3'

  return (
    <div style={newsCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ color: '#E8E8E0', fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>{item.title}</div>
        <span style={{ ...sentimentBadge, color: sentimentColor, borderColor: `${sentimentColor}55` }}>
          {item.sentiment.toUpperCase()}
        </span>
      </div>
      <div style={newsSummary}>{item.summary}</div>
      <div style={insightLine}><span style={insightLabel}>AI reasoning:</span> {item.aiReasoning}</div>
      <div style={insightLine}><span style={insightLabel}>Fear &amp; Greed link:</span> {item.fearGreedConnection}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ color: '#555', fontSize: 10 }}>{new Date(item.publishedAt).toLocaleString()}</span>
        <a href={item.url} target="_blank" rel="noreferrer" style={newsLink}>
          {item.source} ↗
        </a>
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    LOW:    { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
    MEDIUM: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
    HIGH:   { color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  }
  const c = cfg[level] ?? cfg.MEDIUM
  return (
    <span style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}40`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 }}>
      {level} RISK
    </span>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 16, color: '#E8E8E0', fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  )
}

const panel: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: 24 }
const sectionTitle: React.CSSProperties = { fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 14, marginTop: 24 }
const tokenRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const symStyle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: '#E8E8E0' }
const nameStyle: React.CSSProperties = { fontSize: 11, color: '#555', marginTop: 2 }
const valStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#E8E8E0' }
const pctStyle: React.CSSProperties = { fontSize: 12, color: '#555', width: 40, textAlign: 'right' }
const allocBar: React.CSSProperties = {
  height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden',
  background: 'rgba(255,255,255,0.05)',
}
const riskBox: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8, padding: 16,
}
const actRow: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
}
const newsCard: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.02)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 10,
}
const sentimentBadge: React.CSSProperties = {
  border: '1px solid',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 10,
  letterSpacing: 0.8,
  whiteSpace: 'nowrap',
}
const newsSummary: React.CSSProperties = {
  color: '#A0A0A0',
  fontSize: 12,
  lineHeight: 1.5,
  marginTop: 8,
}
const insightLine: React.CSSProperties = {
  color: '#B8B8B0',
  fontSize: 11,
  lineHeight: 1.5,
  marginTop: 8,
}
const insightLabel: React.CSSProperties = {
  color: '#7F7F78',
}
const newsLink: React.CSSProperties = {
  color: '#7C83FF',
  fontSize: 11,
  textDecoration: 'none',
}
const gaugeCard: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.02)',
  borderRadius: 10,
  padding: 14,
  marginBottom: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

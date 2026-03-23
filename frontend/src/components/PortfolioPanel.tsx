import type { WalletData } from '../types/index.js'

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
}

export function PortfolioPanel({ wallet }: Props) {
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

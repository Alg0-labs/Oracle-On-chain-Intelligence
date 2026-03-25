import { useState, useCallback } from 'react'
import type { CSSProperties } from 'react'
import type { WalletData, Transaction, DecodedTransfer, MarketData, MarketNewsInsight } from '../types/index.js'
import { fetchTransactions } from '../lib/api.js'

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

function activityBadgeStyle(type: string): CSSProperties {
  const colors: Record<string, { fg: string; bg: string }> = {
    swap:     { fg: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    send:     { fg: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
    receive:  { fg: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
    contract: { fg: '#888',    bg: 'rgba(255,255,255,0.04)' },
  }
  const c = colors[type] ?? colors.contract
  return {
    fontSize: 9, fontWeight: 700, letterSpacing: 1,
    color: c.fg, background: c.bg,
    border: `1px solid ${c.fg}33`,
    borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace',
    whiteSpace: 'nowrap' as const,
  }
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ADE80' : '#555', fontSize: 10, padding: '0 4px' }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

function DetailRow({ label, value, mono = false, children }: {
  label: string; value?: string; mono?: boolean; children?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: '#555', fontSize: 11, letterSpacing: 1, minWidth: 100, flexShrink: 0 }}>{label}</span>
      {children ?? (
        <span style={{ color: '#C0C0B8', fontSize: 12, fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all', textAlign: 'right' }}>
          {value}
        </span>
      )}
    </div>
  )
}

function TransactionDetailModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const statusColor = tx.status === 'success' ? '#4ADE80' : '#F87171'
  const date = new Date(tx.timestamp)
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={activityBadgeStyle(tx.activityType)}>{tx.activityType.toUpperCase()}</span>
            <span style={{ color: statusColor, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>
              ● {tx.status.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {/* Hash */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>TRANSACTION HASH</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: '#A0A0A0', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{tx.hash}</span>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <CopyButton text={tx.hash} />
              <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer"
                style={{ color: '#6366F1', fontSize: 10, textDecoration: 'none' }}>↗ Etherscan</a>
            </div>
          </div>
        </div>

        {/* Transfers */}
        {tx.transfers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={modalSection}>TRANSFERS</div>
            {tx.transfers.map((t, i) => (
              <TransferRow key={i} t={t} />
            ))}
          </div>
        )}

        {/* Fee */}
        {(tx.feeNativeEth != null || tx.feeUsd != null) && (
          <div style={{ marginBottom: 16 }}>
            <div style={modalSection}>NETWORK FEE</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {tx.feeNativeEth != null && (
                <div>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>ETH</div>
                  <div style={{ fontSize: 16, color: '#E8E8E0', fontWeight: 700, marginTop: 2 }}>{tx.feeNativeEth.toFixed(6)}</div>
                </div>
              )}
              {tx.feeUsd != null && (
                <div>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>USD</div>
                  <div style={{ fontSize: 16, color: '#E8E8E0', fontWeight: 700, marginTop: 2 }}>${tx.feeUsd.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div style={modalSection}>DETAILS</div>
        <DetailRow label="DATE" value={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`} />
        <DetailRow label="FROM">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#C0C0B8', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{tx.from}</span>
            <CopyButton text={tx.from} />
          </div>
        </DetailRow>
        <DetailRow label="TO">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#C0C0B8', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{tx.to}</span>
            <CopyButton text={tx.to} />
          </div>
        </DetailRow>
        {tx.value !== '0.000000' && (
          <DetailRow label="ETH VALUE" value={`${tx.value} ETH ($${tx.valueUsd.toFixed(2)})`} />
        )}
        {tx.method && <DetailRow label="METHOD" value={tx.method} mono />}
        {tx.gasUsed && <DetailRow label="GAS USED" value={Number(tx.gasUsed).toLocaleString()} />}
        {tx.gasPrice && <DetailRow label="GAS PRICE" value={`${(Number(tx.gasPrice) / 1e9).toFixed(2)} Gwei`} />}
      </div>
    </div>
  )
}

function TransferRow({ t }: { t: DecodedTransfer }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 6, marginBottom: 4,
      background: t.direction === 'out' ? 'rgba(251,191,36,0.05)' : 'rgba(74,222,128,0.05)',
      border: `1px solid ${t.direction === 'out' ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)'}`,
    }}>
      <span style={{ fontSize: 16, color: t.direction === 'out' ? '#FBBF24' : '#4ADE80', lineHeight: 1 }}>
        {t.direction === 'out' ? '↑' : '↓'}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.logo && <img src={t.logo} alt={t.symbol} style={{ width: 16, height: 16, borderRadius: '50%' }} onError={e => (e.currentTarget.style.display = 'none')} />}
          <span style={{ color: '#E8E8E0', fontSize: 13, fontWeight: 700 }}>{t.amountFormatted}</span>
          <span style={{ color: '#6366F1', fontSize: 13, fontWeight: 700 }}>{t.symbol}</span>
        </div>
        <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{t.name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: t.direction === 'out' ? '#FBBF24' : '#4ADE80', fontSize: 10, fontWeight: 600 }}>
          {t.direction === 'out' ? 'SENT' : 'RECEIVED'}
        </div>
        <a href={`https://etherscan.io/token/${t.tokenAddress}`} target="_blank" rel="noreferrer"
          style={{ color: '#444', fontSize: 9, textDecoration: 'none' }}>view token ↗</a>
      </div>
    </div>
  )
}

// ─── Transaction Row (list) ───────────────────────────────────────────────────

function TxRow({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ ...actRow, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ color: tx.status === 'success' ? '#6366F1' : '#F87171', fontSize: 8, flexShrink: 0 }}>◆</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={activityBadgeStyle(tx.activityType)}>{tx.activityType.toUpperCase()}</span>
          <span style={{ color: '#C0C0B8', fontSize: 12 }}>{tx.description}</span>
        </div>
        {tx.transfers.length > 0 && (
          <div style={{ color: '#555', fontSize: 10, marginTop: 5, lineHeight: 1.6 }}>
            {tx.transfers.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {t.logo && <img src={t.logo} alt={t.symbol} style={{ width: 10, height: 10, borderRadius: '50%' }} onError={e => (e.currentTarget.style.display = 'none')} />}
                <span style={{ color: t.direction === 'out' ? '#FBBF24' : '#4ADE80' }}>{t.direction === 'out' ? '↑' : '↓'}</span>
                <span>{t.amountFormatted} {t.symbol}</span>
                <span style={{ color: '#3a3a3a' }}>· {t.name}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ color: '#3a3a3a', fontSize: 10, marginTop: 4 }}>
          {new Date(tx.timestamp).toLocaleDateString()} · {tx.hash.slice(0, 10)}…
        </div>
      </div>
      <span style={{ color: '#444', fontSize: 10, flexShrink: 0 }}>›</span>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

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

  const [txList, setTxList] = useState<Transaction[]>(wallet.transactions)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(wallet.transactions.length >= 10)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const result = await fetchTransactions(wallet.address, nextCursor ?? undefined, 10)
      setTxList(prev => {
        const existing = new Set(prev.map(t => t.hash))
        return [...prev, ...result.transactions.filter(t => !existing.has(t.hash))]
      })
      setNextCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      /* non-fatal */
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, nextCursor, wallet.address])

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

      {/* Transactions */}
      <div style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>RECENT ACTIVITY</span>
        <span style={{ color: '#3a3a3a', fontWeight: 400 }}>{txList.length} loaded</span>
      </div>

      {txList.map((tx) => (
        <TxRow key={tx.hash} tx={tx} onClick={() => setSelectedTx(tx)} />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          style={loadMoreBtn}
        >
          {loadingMore ? 'Loading…' : 'Load more transactions'}
        </button>
      )}

      {!hasMore && txList.length > 0 && (
        <div style={{ textAlign: 'center', color: '#3a3a3a', fontSize: 10, padding: '14px 0', letterSpacing: 1 }}>
          ALL TRANSACTIONS LOADED
        </div>
      )}

      {/* Transaction detail modal */}
      {selectedTx && (
        <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
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

const panel: CSSProperties = { flex: 1, overflowY: 'auto', padding: 24 }
const sectionTitle: CSSProperties = { fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 14, marginTop: 24 }
const tokenRow: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const symStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: '#E8E8E0' }
const nameStyle: CSSProperties = { fontSize: 11, color: '#555', marginTop: 2 }
const valStyle: CSSProperties = { fontSize: 14, fontWeight: 600, color: '#E8E8E0' }
const pctStyle: CSSProperties = { fontSize: 12, color: '#555', width: 40, textAlign: 'right' }
const allocBar: CSSProperties = {
  height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden',
  background: 'rgba(255,255,255,0.05)',
}
const riskBox: CSSProperties = {
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8, padding: 16,
}
const actRow: CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 8px',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  borderRadius: 6, transition: 'background 0.15s',
}
const loadMoreBtn: CSSProperties = {
  width: '100%', marginTop: 12, padding: '10px 0',
  background: 'rgba(99,102,241,0.08)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 6, color: '#6366F1',
  fontSize: 11, letterSpacing: 1, cursor: 'pointer',
  fontFamily: 'monospace',
}
const overlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20,
}
const modal: CSSProperties = {
  background: '#111',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: 24,
  width: '100%', maxWidth: 520,
  maxHeight: '85vh', overflowY: 'auto',
}
const modalSection: CSSProperties = {
  fontSize: 10, color: '#555', letterSpacing: 2,
  marginBottom: 10, marginTop: 0,
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

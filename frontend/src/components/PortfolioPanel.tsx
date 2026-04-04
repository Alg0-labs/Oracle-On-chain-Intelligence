import { useState, useCallback } from 'react'
import type { CSSProperties } from 'react'
import type { WalletData, Transaction, DecodedTransfer, MarketData, MarketNewsInsight, NativeBalance } from '../types/index.js'
import { fetchTransactions } from '../lib/api.js'

// ─── Token / Chain helpers ────────────────────────────────────────────────────

const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA', WETH: '#627EEA',
  BTC: '#F7931A', WBTC: '#F7931A',
  USDC: '#2775CA', USDT: '#26A17B', DAI: '#F5AC37',
  SOL: '#9945FF', ARB: '#12AAFF', OP: '#FF0420',
  MATIC: '#8247E5', POL: '#8247E5', LINK: '#375BD2', UNI: '#FF007A',
  AAVE: '#B6509E', MKR: '#1AAB9B', BNB: '#F3BA2F', AVAX: '#E84142',
}
function tokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol.toUpperCase()] ?? '#6366F1'
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: '#627EEA', Polygon: '#8247E5', BSC: '#F3BA2F',
  Arbitrum: '#12AAFF', Optimism: '#FF0420', Base: '#0052FF', Avalanche: '#E84142',
}
function chainColor(chain: string): string {
  return CHAIN_COLORS[chain] ?? '#6366F1'
}

function ChainBadge({ chain }: { chain: string }) {
  const short: Record<string, string> = {
    Ethereum: 'ETH', Polygon: 'POLY', BSC: 'BSC',
    Arbitrum: 'ARB', Optimism: 'OP', Base: 'BASE', Avalanche: 'AVAX',
  }
  const label = short[chain] ?? chain.slice(0, 4).toUpperCase()
  const color = chainColor(chain)
  return (
    <span style={{
      fontSize: 8, fontWeight: 600, letterSpacing: 0.8,
      color, background: `${color}18`, border: `1px solid ${color}33`,
      borderRadius: 999, padding: '1px 6px',
      fontFamily: 'var(--font-data)', flexShrink: 0,
    }}>{label}</span>
  )
}

function activityBadgeStyle(type: string): CSSProperties {
  const colors: Record<string, { fg: string; bg: string }> = {
    swap:     { fg: '#a3a6ff', bg: 'rgba(163,166,255,0.1)' },
    send:     { fg: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
    receive:  { fg: '#4ADE80', bg: 'rgba(74,222,128,0.08)' },
    contract: { fg: 'var(--c-text-5)', bg: 'var(--c-surface-2)' },
  }
  const c = colors[type] ?? colors.contract
  return {
    fontSize: 9, fontWeight: 600, letterSpacing: 0.8,
    color: c.fg, background: c.bg,
    borderRadius: 999, padding: '2px 7px',
    fontFamily: 'var(--font-data)', whiteSpace: 'nowrap' as const,
  }
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ADE80' : 'var(--c-text-6)', fontSize: 10, padding: '0 4px' }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────

function DetailRow({ label, value, mono = false, children }: {
  label: string; value?: string; mono?: boolean; children?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-6)', fontSize: 11, letterSpacing: 1, minWidth: 100, flexShrink: 0, fontFamily: 'var(--font-data)' }}>{label}</span>
      {children ?? (
        <span style={{ color: 'var(--c-text-3)', fontSize: 12, fontFamily: mono ? 'var(--font-data)' : 'inherit', wordBreak: 'break-all', textAlign: 'right' }}>
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
    <div style={txOverlay} onClick={onClose}>
      <div style={txModal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={activityBadgeStyle(tx.activityType)}>{tx.activityType.toUpperCase()}</span>
            <span style={{ color: statusColor, fontSize: 10, fontFamily: 'var(--font-data)', letterSpacing: 1 }}>
              ● {tx.status.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--c-text-5)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ background: 'var(--c-surface)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ color: 'var(--c-text-6)', fontSize: 9, letterSpacing: 2, marginBottom: 4, fontFamily: 'var(--font-data)' }}>TRANSACTION HASH</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: 'var(--c-text-4)', fontSize: 11, fontFamily: 'var(--font-data)', wordBreak: 'break-all' }}>{tx.hash}</span>
            <CopyButton text={tx.hash} />
          </div>
        </div>

        {tx.transfers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={modalSection}>TRANSFERS</div>
            {tx.transfers.map((t, i) => <TransferRow key={i} t={t} />)}
          </div>
        )}

        {(tx.feeNativeEth != null || tx.feeUsd != null) && (
          <div style={{ marginBottom: 16 }}>
            <div style={modalSection}>NETWORK FEE</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {tx.feeNativeEth != null && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 1, fontFamily: 'var(--font-data)' }}>ETH</div>
                  <div style={{ fontSize: 16, color: 'var(--c-text)', fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-data)' }}>{tx.feeNativeEth.toFixed(6)}</div>
                </div>
              )}
              {tx.feeUsd != null && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 1, fontFamily: 'var(--font-data)' }}>USD</div>
                  <div style={{ fontSize: 16, color: 'var(--c-text)', fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-data)' }}>${tx.feeUsd.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={modalSection}>DETAILS</div>
        <DetailRow label="DATE" value={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`} />
        <DetailRow label="FROM">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--c-text-3)', fontSize: 11, fontFamily: 'var(--font-data)', wordBreak: 'break-all' }}>{tx.from}</span>
            <CopyButton text={tx.from} />
          </div>
        </DetailRow>
        <DetailRow label="TO">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--c-text-3)', fontSize: 11, fontFamily: 'var(--font-data)', wordBreak: 'break-all' }}>{tx.to}</span>
            <CopyButton text={tx.to} />
          </div>
        </DetailRow>
        {tx.value !== '0.000000' && (
          <DetailRow label="VALUE" value={`${tx.value} ETH ($${tx.valueUsd.toFixed(2)})`} />
        )}
        {tx.method && <DetailRow label="METHOD" value={tx.method} mono />}
        {tx.gasUsed && <DetailRow label="GAS USED" value={Number(tx.gasUsed).toLocaleString()} />}
        {tx.gasPrice && <DetailRow label="GAS PRICE" value={`${(Number(tx.gasPrice) / 1e9).toFixed(2)} Gwei`} />}
      </div>
    </div>
  )
}

function TransferRow({ t }: { t: DecodedTransfer }) {
  const isOut = t.direction === 'out'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 8, marginBottom: 4,
      background: isOut ? 'rgba(251,191,36,0.05)' : 'rgba(74,222,128,0.05)',
    }}>
      <span style={{ fontSize: 14, color: isOut ? '#FBBF24' : '#4ADE80', lineHeight: 1 }}>
        {isOut ? '↑' : '↓'}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.logo && <img src={t.logo} alt={t.symbol} style={{ width: 16, height: 16, borderRadius: '50%' }} onError={e => (e.currentTarget.style.display = 'none')} />}
          <span style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)' }}>{t.amountFormatted}</span>
          <span style={{ color: '#a3a6ff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)' }}>{t.symbol}</span>
        </div>
        <div style={{ color: 'var(--c-text-6)', fontSize: 10, marginTop: 2 }}>{t.name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: isOut ? '#FBBF24' : '#4ADE80', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-data)' }}>
          {isOut ? 'SENT' : 'RECEIVED'}
        </div>
      </div>
    </div>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TxRow({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={txRow}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ color: tx.status === 'success' ? '#6366F1' : '#F87171', fontSize: 7, flexShrink: 0, marginTop: 2 }}>◆</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={activityBadgeStyle(tx.activityType)}>{tx.activityType.toUpperCase()}</span>
          <span style={{ color: 'var(--c-text-3)', fontSize: 12, fontFamily: 'var(--font-data)' }}>{tx.description}</span>
        </div>
        {tx.transfers.length > 0 && (
          <div style={{ color: 'var(--c-text-6)', fontSize: 10, marginTop: 4, lineHeight: 1.6 }}>
            {tx.transfers.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {t.logo && <img src={t.logo} alt={t.symbol} style={{ width: 10, height: 10, borderRadius: '50%' }} onError={e => (e.currentTarget.style.display = 'none')} />}
                <span style={{ color: t.direction === 'out' ? '#FBBF24' : '#4ADE80' }}>{t.direction === 'out' ? '↑' : '↓'}</span>
                <span>{t.amountFormatted} {t.symbol}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ color: 'var(--c-text-7)', fontSize: 10, marginTop: 3, fontFamily: 'var(--font-data)' }}>
          {new Date(tx.timestamp).toLocaleDateString()} · {tx.hash.slice(0, 10)}…
        </div>
      </div>
      <span style={{ color: 'var(--c-text-7)', fontSize: 12, flexShrink: 0 }}>›</span>
    </div>
  )
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    LOW:    { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
    MEDIUM: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
    HIGH:   { color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  }
  const c = cfg[level] ?? cfg.MEDIUM
  return (
    <span style={{
      color: c.color, background: c.bg,
      borderRadius: 999, padding: '3px 10px',
      fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: 1,
    }}>
      {level} RISK
    </span>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface Props {
  wallet: WalletData
  market: MarketData | null
  isMobile?: boolean
}

export function PortfolioPanel({ wallet, market, isMobile = false }: Props) {
  const nativeAssets = (wallet.nativeBalances ?? [])
    .filter(n => parseFloat(n.balance) > 0 || n.balanceUsd > 0)
    .map((n: NativeBalance) => ({
      symbol: n.symbol,
      name: n.chain === 'Ethereum' ? 'Ethereum' : `${n.name} (native)`,
      usdValue: n.balanceUsd,
      balance: n.balance,
      change24h: undefined as number | undefined,
      chain: n.chain,
      chainId: n.chainId,
    }))

  const allAssets = [...nativeAssets, ...wallet.tokens]
  const total = wallet.netWorthUsd || 1
  const chainBreakdown = wallet.chainBreakdown ?? []

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
    } catch { /* non-fatal */ }
    finally { setLoadingMore(false) }
  }, [loadingMore, hasMore, nextCursor, wallet.address])

  return (
    <div style={panel}>
      <div style={{ ...twoCol, flexDirection: isMobile ? 'column' : 'row' }}>

        {/* ── LEFT: Holdings ─────────────────────────────────────────────── */}
        <div style={leftCol}>

          {/* Portfolio value + chain bar */}
          <div style={netWorthCard}>
            <div style={sectionLabel}>TOTAL PORTFOLIO VALUE</div>
            <div style={netWorthValue}>
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {chainBreakdown.length > 1 && (
              <>
                <div style={{ height: 4, borderRadius: 2, display: 'flex', overflow: 'hidden', marginTop: 14, background: 'var(--c-surface-4)' }}>
                  {chainBreakdown.map(c => (
                    <div key={c.chain}
                      style={{ width: `${(c.usdValue / total) * 100}%`, background: chainColor(c.chain), height: '100%', transition: 'width 0.8s ease' }}
                      title={`${c.chain}: $${c.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {chainBreakdown.map(c => (
                    <div key={c.chain} style={chainPillItem}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: chainColor(c.chain), flexShrink: 0 }} />
                      <span style={{ color: 'var(--c-text-5)', fontSize: 10, fontFamily: 'var(--font-data)' }}>
                        {c.chain} · ${c.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({((c.usdValue / total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Holdings list */}
          <div style={sectionLabel}>HOLDINGS</div>
          <div style={holdingsList}>
            {allAssets.map((t, i) => {
              const pct = ((t.usdValue / total) * 100).toFixed(1)
              const key = `${t.symbol}-${'chain' in t ? t.chain : ''}-${i}`
              return (
                <div key={key} style={holdingRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: `${tokenColor(t.symbol)}22`,
                      border: `1px solid ${tokenColor(t.symbol)}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: tokenColor(t.symbol) }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={symStyle}>{t.symbol}</span>
                        {'chain' in t && t.chain && <ChainBadge chain={t.chain} />}
                      </div>
                      <div style={nameStyle}>{t.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={valStyle}>${t.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                      {t.change24h !== undefined && (
                        <span style={{ fontSize: 11, color: t.change24h >= 0 ? '#4ADE80' : '#F87171', fontFamily: 'var(--font-data)' }}>
                          {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(1)}%
                        </span>
                      )}
                      <span style={pctStyle}>{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Allocation bar */}
          <div style={{ marginTop: 20 }}>
            <div style={sectionLabel}>ALLOCATION</div>
            <div style={allocBar}>
              {allAssets.map((t, i) => (
                <div key={`alloc-${i}`}
                  style={{ width: `${(t.usdValue / total) * 100}%`, background: tokenColor(t.symbol), height: '100%', transition: 'width 0.8s ease' }}
                  title={`${t.symbol} ${((t.usdValue / total) * 100).toFixed(1)}%`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
              {allAssets.map((t, i) => (
                <div key={`legend-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: tokenColor(t.symbol) }} />
                  <span style={{ color: 'var(--c-text-5)', fontSize: 10, fontFamily: 'var(--font-data)' }}>{t.symbol}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NFTs */}
          {wallet.nfts.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={sectionLabel}>NFTS</div>
              <div style={{ color: 'var(--c-text-5)', fontSize: 12, fontFamily: 'var(--font-data)' }}>
                {wallet.nfts.length} NFTs held
              </div>
            </div>
          )}

          {/* Transactions */}
          <div style={{ marginTop: 24 }}>
            <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>RECENT ACTIVITY</span>
              <span style={{ color: 'var(--c-text-8)', fontWeight: 400, letterSpacing: 0 }}>{txList.length} loaded</span>
            </div>
            {txList.map(tx => (
              <TxRow key={tx.hash} tx={tx} onClick={() => setSelectedTx(tx)} />
            ))}
            {hasMore && (
              <button onClick={loadMore} disabled={loadingMore} style={loadMoreBtn}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
            {!hasMore && txList.length > 0 && (
              <div style={{ textAlign: 'center', color: 'var(--c-text-8)', fontSize: 9, padding: '12px 0', letterSpacing: 2, fontFamily: 'var(--font-data)' }}>
                ALL TRANSACTIONS LOADED
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Risk + Market ────────────────────────────────────────── */}
        <div style={rightCol}>

          {/* Risk Analysis */}
          <div style={glassCard}>
            <div style={cardSectionLabel}>RISK ANALYSIS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <RiskBadge level={wallet.riskLevel} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 1.5, fontFamily: 'var(--font-data)' }}>STABLECOIN</div>
                <div style={{ fontSize: 18, color: 'var(--c-text)', fontWeight: 600, fontFamily: 'var(--font-data)' }}>{wallet.stablecoinPct.toFixed(1)}%</div>
              </div>
            </div>
            <p style={{ color: 'var(--c-text-4)', fontSize: 12, margin: 0, lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>{wallet.riskReason}</p>
            <div style={{ marginTop: 14, display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 1.5, fontFamily: 'var(--font-data)' }}>TOP HOLDING</div>
                <div style={{ fontSize: 18, color: 'var(--c-text)', fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-data)' }}>{wallet.topHoldingPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Market Intelligence */}
          {!market ? (
            <div style={{ ...glassCard, color: 'var(--c-text-6)', fontSize: 12 }}>Loading market intelligence…</div>
          ) : (
            <>
              <div style={glassCard}>
                <div style={cardSectionLabel}>FEAR & GREED INDEX</div>
                <FearGreedGauge value={market.fearGreed.value} label={market.fearGreed.label} />
              </div>

              <div style={{ ...cardSectionLabel, marginTop: 8 }}>LATEST MARKET NEWS</div>
              {(market.latestNewsInsights ?? []).slice(0, 10).map(item => (
                <NewsInsightCard key={item.id} item={item} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Transaction detail modal */}
      {selectedTx && (
        <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  )
}

// ─── Fear & Greed Gauge ───────────────────────────────────────────────────────

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  const angle = -120 + (clamped / 100) * 240
  const radians = (angle * Math.PI) / 180
  const radius = 46; const cx = 62; const cy = 62
  const x = cx + radius * Math.cos(radians)
  const y = cy + radius * Math.sin(radians)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="124" height="86" viewBox="0 0 124 86">
        <path d="M16 62 A46 46 0 0 1 39 22" stroke="#E55B63" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M39 22 A46 46 0 0 1 62 16" stroke="#DCA84A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M62 16 A46 46 0 0 1 85 22" stroke="#C2C842" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M85 22 A46 46 0 0 1 108 62" stroke="#3FC09A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--c-text-4)" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="5" fill="var(--c-text-5)" />
      </svg>
      <div style={{ textAlign: 'center', marginTop: -4 }}>
        <div style={{ color: 'var(--c-text)', fontSize: 34, fontWeight: 600, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{clamped}</div>
        <div style={{ color: 'var(--c-text-4)', fontSize: 13, marginTop: 4, fontFamily: 'var(--font-body)' }}>{label}</div>
      </div>
    </div>
  )
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsInsightCard({ item }: { item: MarketNewsInsight }) {
  const sentimentColor =
    item.sentiment === 'bullish' ? '#4ADE80'
    : item.sentiment === 'bearish' ? '#F87171'
    : 'var(--c-text-4)'

  return (
    <div style={newsCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ color: 'var(--c-text)', fontSize: 12, fontWeight: 500, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>{item.title}</div>
        <span style={{ color: sentimentColor, fontSize: 9, fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: 0.8, flexShrink: 0, marginTop: 2 }}>
          {item.sentiment.toUpperCase()}
        </span>
      </div>
      <div style={{ color: 'var(--c-text-4)', fontSize: 11, lineHeight: 1.5, marginTop: 6, fontFamily: 'var(--font-body)' }}>{item.summary}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ color: 'var(--c-text-6)', fontSize: 10, fontFamily: 'var(--font-data)' }}>{new Date(item.publishedAt).toLocaleString()}</span>
        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#a3a6ff', fontSize: 10, textDecoration: 'none', fontFamily: 'var(--font-data)' }}>
          {item.source} ↗
        </a>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const panel: CSSProperties = { flex: 1, overflowY: 'auto', padding: '20px 20px 40px' }

const twoCol: CSSProperties = {
  display: 'flex', gap: 20, alignItems: 'flex-start',
}

const leftCol: CSSProperties = { flex: '1 1 60%', minWidth: 0 }
const rightCol: CSSProperties = { flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }

const netWorthCard: CSSProperties = {
  background: 'var(--c-surface)', borderRadius: 12,
  padding: '18px 20px', marginBottom: 20,
}

const netWorthValue: CSSProperties = {
  fontSize: 32, fontWeight: 600, color: 'var(--c-text)',
  fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
  lineHeight: 1, marginTop: 4,
}

const sectionLabel: CSSProperties = {
  fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 2.5,
  marginBottom: 12, fontFamily: 'var(--font-data)', fontWeight: 600,
}

const cardSectionLabel: CSSProperties = {
  fontSize: 9, color: 'var(--c-primary)', letterSpacing: 2.5,
  marginBottom: 14, fontFamily: 'var(--font-data)', fontWeight: 600,
}

const holdingsList: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2 }

const holdingRow: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 10px', borderRadius: 8,
  transition: 'background 0.15s',
}

const symStyle: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: 'var(--c-text)',
  fontFamily: 'var(--font-data)',
}

const nameStyle: CSSProperties = {
  fontSize: 11, color: 'var(--c-text-6)', marginTop: 2,
  fontFamily: 'var(--font-body)',
}

const valStyle: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: 'var(--c-text)',
  fontFamily: 'var(--font-data)',
}

const pctStyle: CSSProperties = {
  fontSize: 11, color: 'var(--c-text-6)',
  fontFamily: 'var(--font-data)',
}

const allocBar: CSSProperties = {
  height: 6, borderRadius: 3, display: 'flex', overflow: 'hidden',
  background: 'var(--c-surface-4)',
}

const chainPillItem: CSSProperties = { display: 'flex', alignItems: 'center', gap: 5 }

const glassCard: CSSProperties = {
  background: 'var(--c-surface)',
  border: '1px solid var(--c-ghost)',
  borderRadius: 12, padding: '18px 18px',
  backdropFilter: 'blur(8px)',
}

const txRow: CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 8px',
  borderRadius: 8, transition: 'background 0.15s', cursor: 'pointer',
}

const loadMoreBtn: CSSProperties = {
  width: '100%', marginTop: 10, padding: '10px 0',
  background: 'transparent',
  border: '1px solid var(--c-border-5)',
  borderRadius: 999, color: 'var(--c-primary)',
  fontSize: 11, letterSpacing: 1, cursor: 'pointer',
  fontFamily: 'var(--font-data)',
}

const newsCard: CSSProperties = {
  background: 'var(--c-surface)',
  borderRadius: 10, padding: '12px 14px', marginBottom: 8,
}

const txOverlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'var(--c-overlay)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}

const txModal: CSSProperties = {
  background: 'var(--c-modal)',
  border: '1px solid var(--c-ghost)',
  borderRadius: 14, padding: 24,
  width: '100%', maxWidth: 520,
  maxHeight: '85vh', overflowY: 'auto',
  boxShadow: '0 0 60px rgba(99,102,241,0.12)',
}

const modalSection: CSSProperties = {
  fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 2.5,
  marginBottom: 10, fontFamily: 'var(--font-data)', fontWeight: 600,
}

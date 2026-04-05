import { useState, useCallback } from 'react'
import type { CSSProperties } from 'react'
import type { WalletData, Transaction, DecodedTransfer } from '../types/index.js'
import { fetchTransactions } from '../lib/api.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts * 1000) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

type TxType = 'receive' | 'send' | 'swap' | 'contract'

const TYPE_CONFIG: Record<TxType, { label: string; icon: string; color: string; bg: string }> = {
  receive:  { label: 'Received',  icon: '↓', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  send:     { label: 'Sent',      icon: '↑', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  swap:     { label: 'Swapped',   icon: '⇄', color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  contract: { label: 'Contract',  icon: '⬡', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
}

function getConfig(type: string) {
  return TYPE_CONFIG[type as TxType] ?? TYPE_CONFIG.contract
}

function typeBadgeStyle(type: string): CSSProperties {
  const cfg = getConfig(type)
  return {
    fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
    color: cfg.color, background: cfg.bg,
    borderRadius: 999, padding: '2px 7px',
    fontFamily: 'var(--font-data)', whiteSpace: 'nowrap',
  }
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ADE80' : 'var(--text-5)', fontSize: 12, padding: '0 4px', flexShrink: 0 }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

// ── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({ label, value, mono = false, children }: {
  label: string; value?: string; mono?: boolean; children?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-5)', fontSize: 11, letterSpacing: 0.8, minWidth: 100, flexShrink: 0, fontFamily: 'var(--font-data)' }}>{label}</span>
      {children ?? (
        <span style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-all', textAlign: 'right', marginLeft: 12 }}>
          {value}
        </span>
      )}
    </div>
  )
}

// ── Transfer Row ──────────────────────────────────────────────────────────────

function TransferRow({ t }: { t: DecodedTransfer }) {
  const isOut = t.direction === 'out'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 8, marginBottom: 4,
      background: isOut ? 'rgba(248,113,113,0.05)' : 'rgba(34,197,94,0.05)',
    }}>
      <span style={{ fontSize: 16, color: isOut ? '#F87171' : '#22C55E', lineHeight: 1, flexShrink: 0 }}>
        {isOut ? '↑' : '↓'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.logo && <img src={t.logo} alt={t.symbol} style={{ width: 16, height: 16, borderRadius: '50%' }} onError={e => (e.currentTarget.style.display = 'none')} />}
          <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)' }}>{t.amountFormatted}</span>
          <span style={{ color: '#818CF8', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)' }}>{t.symbol}</span>
        </div>
        <div style={{ color: 'var(--text-5)', fontSize: 10, marginTop: 2 }}>{t.name}</div>
      </div>
      <span style={{ color: isOut ? '#F87171' : '#22C55E', fontSize: 9, fontWeight: 700, letterSpacing: 0.8, fontFamily: 'var(--font-data)' }}>
        {isOut ? 'SENT' : 'RECEIVED'}
      </span>
    </div>
  )
}

// ── Transaction Detail Modal ──────────────────────────────────────────────────

function TxDetailModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const cfg = getConfig(tx.activityType)
  const statusColor = tx.status === 'success' ? '#22C55E' : '#F87171'
  const date = new Date(tx.timestamp * 1000)

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={typeBadgeStyle(tx.activityType)}>{tx.activityType.toUpperCase()}</span>
            <span style={{ color: statusColor, fontSize: 10, fontFamily: 'var(--font-data)', letterSpacing: 1 }}>
              ● {tx.status.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* TX Hash */}
        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ color: 'var(--text-5)', fontSize: 9, letterSpacing: 2, marginBottom: 4, fontFamily: 'var(--font-data)' }}>TRANSACTION HASH</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{tx.hash}</span>
            <CopyButton text={tx.hash} />
          </div>
        </div>

        {/* Transfers */}
        {tx.transfers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={modalSectionLbl}>TRANSFERS</div>
            {tx.transfers.map((t, i) => <TransferRow key={i} t={t} />)}
          </div>
        )}

        {/* Network fee */}
        {(tx.feeNativeEth != null || tx.feeUsd != null) && (
          <div style={{ marginBottom: 16 }}>
            <div style={modalSectionLbl}>NETWORK FEE</div>
            <div style={{ display: 'flex', gap: 24 }}>
              {tx.feeNativeEth != null && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-5)', letterSpacing: 1.2, fontFamily: 'var(--font-data)' }}>ETH</div>
                  <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-data)' }}>{tx.feeNativeEth.toFixed(6)}</div>
                </div>
              )}
              {tx.feeUsd != null && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-5)', letterSpacing: 1.2, fontFamily: 'var(--font-data)' }}>USD</div>
                  <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-data)' }}>${tx.feeUsd.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div style={modalSectionLbl}>DETAILS</div>
        <DetailRow label="DATE" value={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`} />
        <DetailRow label="FROM">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12, minWidth: 0 }}>
            <span style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{tx.from}</span>
            <CopyButton text={tx.from} />
          </div>
        </DetailRow>
        <DetailRow label="TO">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12, minWidth: 0 }}>
            <span style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{tx.to}</span>
            <CopyButton text={tx.to} />
          </div>
        </DetailRow>
        {tx.value !== '0.000000' && (
          <DetailRow label="VALUE" value={`${tx.value} ETH ($${tx.valueUsd.toFixed(2)})`} />
        )}
        {tx.method && <DetailRow label="METHOD" value={tx.method} mono />}
        {tx.gasUsed && <DetailRow label="GAS USED" value={Number(tx.gasUsed).toLocaleString()} />}
        {tx.gasPrice && <DetailRow label="GAS PRICE" value={`${(Number(tx.gasPrice) / 1e9).toFixed(2)} Gwei`} />}

        {/* Etherscan link */}
        <a
          href={`https://etherscan.io/tx/${tx.hash}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--accent)', fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'border-color 0.15s' }}
        >
          View on Etherscan ↗
        </a>

      </div>
    </div>
  )
}

// ── Transaction Card ──────────────────────────────────────────────────────────

function TxCard({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  const cfg = getConfig(tx.activityType)
  const hasTransfers = tx.transfers.length > 0

  return (
    <div
      style={txCard}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-sub)'; e.currentTarget.style.cursor = 'pointer' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: cfg.bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 16, color: cfg.color,
      }}>
        {cfg.icon}
      </div>

      {/* Middle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cfg.label}</span>
          {tx.status === 'failed' && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, color: '#F87171', background: 'rgba(248,113,113,0.1)', borderRadius: 999, padding: '1px 6px' }}>
              FAILED
            </span>
          )}
        </div>

        {hasTransfers ? (
          <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tx.transfers.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {t.logo && (
                  <img src={t.logo} alt={t.symbol} style={{ width: 13, height: 13, borderRadius: '50%' }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <span style={{ fontSize: 12, fontFamily: 'var(--font-data)', color: t.direction === 'out' ? '#F87171' : '#22C55E', fontWeight: 500 }}>
                  {t.direction === 'out' ? '−' : '+'}{t.amountFormatted} {t.symbol}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 3 }}>{tx.description}</div>
        )}

        <div style={{ fontSize: 10, color: 'var(--text-5)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          {tx.activityType === 'receive' ? `from ${tx.from.slice(0, 8)}…${tx.from.slice(-6)}`
           : tx.activityType === 'send'  ? `to ${tx.to.slice(0, 8)}…${tx.to.slice(-6)}`
           : `${tx.hash.slice(0, 10)}…`}
        </div>
      </div>

      {/* Right */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {tx.valueUsd > 0 && (
          <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: tx.activityType === 'receive' ? '#22C55E' : tx.activityType === 'send' ? '#F87171' : 'var(--text)' }}>
            {tx.activityType === 'receive' ? '+' : tx.activityType === 'send' ? '−' : ''}${tx.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        )}
        {tx.feeUsd != null && tx.feeUsd > 0 && (
          <div style={{ fontSize: 10, color: 'var(--text-5)', marginTop: 2 }}>fee ${tx.feeUsd.toFixed(2)}</div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-5)', marginTop: 4 }}>{timeAgo(tx.timestamp)}</div>
        <div style={{ fontSize: 10, color: 'var(--text-6)', marginTop: 3 }}>click for details</div>
      </div>
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────

interface Props {
  wallet: WalletData
}

export function TransactionsPanel({ wallet }: Props) {
  const [txList, setTxList]         = useState<Transaction[]>(wallet.transactions)
  const [nextCursor, setNext]       = useState<string | null>(null)
  const [hasMore, setHasMore]       = useState(wallet.transactions.length >= 10)
  const [loadingMore, setLoading]   = useState(false)
  const [filter, setFilter]         = useState<string>('all')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoading(true)
    try {
      const result = await fetchTransactions(wallet.address, nextCursor ?? undefined, 20)
      setTxList(prev => {
        const seen = new Set(prev.map(t => t.hash))
        return [...prev, ...result.transactions.filter(t => !seen.has(t.hash))]
      })
      setNext(result.nextCursor)
      setHasMore(result.hasMore)
    } catch { /* non-fatal */ }
    finally { setLoading(false) }
  }, [loadingMore, hasMore, nextCursor, wallet.address])

  const FILTERS = ['all', 'receive', 'send', 'swap', 'contract']
  const filtered = filter === 'all' ? txList : txList.filter(t => t.activityType === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Header */}
      <header style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, background: 'var(--bg)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>Transactions</h1>
        <span style={{ fontSize: 11, color: 'var(--text-5)' }}>{txList.length} loaded</span>
      </header>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
              fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
              cursor: 'pointer', transition: 'all 0.15s',
              background: filter === f ? 'var(--accent)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--text-4)',
              border: filter === f ? '1px solid transparent' : '1px solid var(--border)',
            }}
          >
            {f === 'all' ? 'All' : getConfig(f).label + 's'}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--text-5)' }}>No {filter} transactions found</p>
          </div>
        ) : (
          <>
            {filtered.map(tx => (
              <TxCard key={tx.hash} tx={tx} onClick={() => setSelectedTx(tx)} />
            ))}
            {hasMore && (
              <button onClick={loadMore} disabled={loadingMore} style={loadMoreBtn}>
                {loadingMore ? 'Loading…' : 'Load more transactions'}
              </button>
            )}
            {!hasMore && txList.length > 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-6)', fontSize: 10, padding: '16px 0', letterSpacing: 2, fontFamily: 'var(--font-data)' }}>
                ALL TRANSACTIONS LOADED
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedTx && (
        <TxDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const txCard: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 14,
  padding: '14px 16px', borderRadius: 10, marginBottom: 6,
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  transition: 'border-color 0.15s',
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}

const modal: React.CSSProperties = {
  background: 'var(--bg-muted)',
  border: '1px solid var(--border-sub)',
  borderRadius: 14, padding: 24,
  width: '100%', maxWidth: 520,
  maxHeight: '85vh', overflowY: 'auto',
  boxShadow: '0 0 60px rgba(99,102,241,0.15)',
}

const modalSectionLbl: React.CSSProperties = {
  fontSize: 9, color: 'var(--text-5)', letterSpacing: 2.5,
  marginBottom: 10, fontFamily: 'var(--font-data)', fontWeight: 600,
}

const loadMoreBtn: React.CSSProperties = {
  width: '100%', marginTop: 12, padding: '12px 0',
  background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--accent)',
  fontSize: 12, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--font-body)', transition: 'border-color 0.15s',
}

import { useState, useEffect } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import { ChatPanel } from './components/ChatPanel.js'
import { PortfolioPanel } from './components/PortfolioPanel.js'
import { fetchWallet, fetchMarket, refreshWallet } from './lib/api.js'
import { useTheme } from './lib/theme.js'
import { useIsMobile } from './lib/mobile.js'
import type { WalletData, MarketData } from './types/index.js'

type Tab = 'chat' | 'portfolio'

const EVM_CHAINS = [
  { name: 'Ethereum', color: '#627EEA' },
  { name: 'Base',     color: '#0052FF' },
  { name: 'Arbitrum', color: '#12AAFF' },
  { name: 'Optimism', color: '#FF0420' },
  { name: 'Polygon',  color: '#8247E5' },
  { name: 'zkSync',   color: '#8C8DFC' },
  { name: 'Avalanche',color: '#E84142' },
]

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { theme, toggle } = useTheme()
  const isMobile = useIsMobile()

  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [market, setMarket] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('chat')
  const [snapshotUpdatedAt, setSnapshotUpdatedAt] = useState<string | null>(null)
  const [refreshingWallet, setRefreshingWallet] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !isConnected) {
      setWallet(null); setMarket(null); setSnapshotUpdatedAt(null)
      setLoading(false); setError(null)
      return
    }
    let cancelled = false
    setLoading(true); setError(null)
    Promise.all([fetchWallet(address), fetchMarket(address)])
      .then(([wRes, marketData]) => {
        if (cancelled) return
        setWallet(wRes.wallet); setSnapshotUpdatedAt(wRes.snapshotUpdatedAt); setMarket(marketData)
      })
      .catch(err => { if (!cancelled) setError(err.message ?? 'Failed to load wallet') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [address, isConnected])

  const handleRefreshPortfolio = () => {
    if (!address || refreshingWallet) return
    setRefreshingWallet(true); setRefreshError(null)
    refreshWallet(address)
      .then(wRes => { setWallet(wRes.wallet); setSnapshotUpdatedAt(wRes.snapshotUpdatedAt); return fetchMarket(address) })
      .then(md => setMarket(md))
      .catch(err => setRefreshError(err.message ?? 'Refresh failed'))
      .finally(() => setRefreshingWallet(false))
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={root}>
        <Noise />
        <Grid />
        <Glow />
        <ThemeToggle theme={theme} toggle={toggle} floating />

        <div style={{ ...landing, gap: isMobile ? 20 : 28, padding: isMobile ? '60px 24px 40px' : 40 }}>
          <OracleLogo size={isMobile ? 'lg' : 'xl'} />

          <div style={{ textAlign: 'center', maxWidth: 540 }}>
            <h1 style={{ ...heroTagline, fontSize: isMobile ? 26 : 'clamp(24px, 3.5vw, 42px)' }}>
              On-chain intelligence, distilled.
            </h1>
            <p style={{ ...heroSub, fontSize: isMobile ? 14 : 15 }}>
              Connect your wallet. Ask anything about your portfolio
              across every EVM chain — in plain language.
            </p>
          </div>

          <button style={ctaBtn} onClick={() => open()}>
            Connect Wallet →
          </button>

          <div style={{ ...pillsRow, gap: isMobile ? 8 : 10 }}>
            {['Every EVM Chain', 'AI Portfolio Analysis', 'Natural Language Sends'].map(f => (
              <span key={f} style={featurePill}>{f}</span>
            ))}
          </div>

          <div style={{ ...commandCard, maxWidth: isMobile ? '100%' : 480, padding: isMobile ? '14px 16px' : '18px 24px' }}>
            <div style={commandCardLabel}>NATURAL LANGUAGE TRANSFERS</div>
            <p style={commandCardText}>
              Say{' '}<code style={codeSnippet}>"send 50 USDC to 0x..."</code>
              {' '}or{' '}<code style={codeSnippet}>"send 0.5 ETH to vitalik.eth"</code>
              {' '}— ØRACLE handles the rest.
            </p>
          </div>

          {!isMobile && (
            <div style={chainsRow}>
              {EVM_CHAINS.map(c => (
                <div key={c.name} style={chainItem}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={chainLabel}>{c.name}</span>
                </div>
              ))}
            </div>
          )}
          {isMobile && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {EVM_CHAINS.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                  <span style={{ ...chainLabel, fontSize: 10 }}>{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={root}>
        <Noise /><Grid /><Glow />
        <div style={landing}>
          <OracleLogo size="lg" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={loadSpinner} />
            <p style={{ color: 'var(--c-text-4)', fontSize: 13, fontFamily: 'var(--font-data)', margin: 0 }}>
              Indexing {address?.slice(0, 10)}...
            </p>
            <p style={{ color: 'var(--c-text-6)', fontSize: 11, fontFamily: 'var(--font-data)', margin: 0 }}>
              Fetching balances, tokens & transactions
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={root}>
        <Noise /><Grid />
        <div style={landing}>
          <OracleLogo size="lg" />
          <div style={errorCard}>
            <p style={{ color: '#ff6e84', fontFamily: 'var(--font-data)', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
          <button style={ctaBtn} onClick={() => open()}>Retry / Switch Wallet</button>
        </div>
      </div>
    )
  }

  if (!wallet) return null

  // ── Main App ───────────────────────────────────────────────────────────────
  return (
    <div style={root}>
      <Noise /><Grid />

      {/* Header */}
      <header style={{ ...appHeader, padding: isMobile ? '10px 14px' : '12px 20px' }}>
        <OracleLogo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          <RiskBadge level={wallet.riskLevel} />
          {!isMobile && wallet.ensName && <span style={ensName}>{wallet.ensName}</span>}
          <ThemeToggle theme={theme} toggle={toggle} />
          <w3m-button size="sm" />
        </div>
      </header>

      {/* Net Worth Bar */}
      {isMobile ? (
        <div style={worthBarMobile}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={barLabel}>TOTAL NET WORTH</div>
              <div style={{ ...worthValue, fontSize: 22 }}>
                ${wallet.netWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={barLabel}>NATIVE</div>
              <div style={{ ...barValueBold, fontSize: 14 }}>
                {parseFloat(wallet.ethBalance).toFixed(4)} ETH
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ ...barValue, fontSize: 11 }}>
              {wallet.chain} · {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
            </span>
            <button
              style={{ ...refreshButton, opacity: refreshingWallet ? 0.5 : 1 }}
              onClick={handleRefreshPortfolio}
              disabled={refreshingWallet}
            >
              {refreshingWallet ? '…' : '↻'}
            </button>
          </div>
          {refreshError && <span style={refreshErrStyle}>{refreshError}</span>}
        </div>
      ) : (
        <div style={worthBar}>
          <div>
            <div style={barLabel}>TOTAL NET WORTH</div>
            <div style={worthValue}>${wallet.netWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div style={barLabel}>NETWORK</div>
            <div style={barValue}>{wallet.chain} · {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</div>
          </div>
          <div>
            <div style={barLabel}>NATIVE BALANCE</div>
            <div style={barValueBold}>{parseFloat(wallet.ethBalance).toFixed(4)} ETH</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={barLabel}>DATA</div>
            <button
              style={{ ...refreshButton, opacity: refreshingWallet ? 0.5 : 1 }}
              onClick={handleRefreshPortfolio}
              disabled={refreshingWallet}
            >
              {refreshingWallet ? '…' : '↻ Refresh'}
            </button>
            {snapshotUpdatedAt && (
              <span style={snapLabel}>
                {new Date(snapshotUpdatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            )}
            {refreshError && <span style={refreshErrStyle}>{refreshError}</span>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={tabsBar}>
        {(['chat', 'portfolio'] as Tab[]).map(t => (
          <button key={t} style={{ ...tabButton, ...(tab === t ? tabActive : {}) }} onClick={() => setTab(t)}>
            {t === 'chat' ? 'AI CHAT' : 'PORTFOLIO'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={contentArea}>
        {tab === 'chat'
          ? <ChatPanel wallet={wallet} address={wallet.address} snapshotUpdatedAt={snapshotUpdatedAt} onWalletRefresh={handleRefreshPortfolio} />
          : <PortfolioPanel wallet={wallet} market={market} isMobile={isMobile} />
        }
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

export function OracleLogo({ size }: { size: 'sm' | 'lg' | 'xl' }) {
  const fontSize = { xl: 40, lg: 28, sm: 16 }[size]
  const spacing  = { xl: 12, lg: 9,  sm: 5  }[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', lineHeight: 1 }}>
      <span style={{
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'var(--font-data)',
      }}>⌀</span>
      <span style={{
        fontSize,
        fontWeight: 700,
        letterSpacing: spacing,
        color: 'var(--c-text)',
        fontFamily: 'var(--font-data)',
        paddingLeft: 2,
      }}>RACLE</span>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    LOW:    { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)'   },
    MEDIUM: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)'   },
    HIGH:   { color: '#F87171', bg: 'rgba(248,113,113,0.1)'  },
  }
  const c = cfg[level] ?? cfg.MEDIUM
  return (
    <span style={{
      color: c.color, background: c.bg,
      border: `1px solid ${c.color}33`,
      borderRadius: 999, padding: '3px 10px',
      fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: 1,
    }}>
      {level} RISK
    </span>
  )
}

function ThemeToggle({ theme, toggle, floating }: { theme: string; toggle: () => void; floating?: boolean }) {
  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'var(--c-surface-2)',
        border: '1px solid var(--c-border-5)',
        borderRadius: 8,
        width: 34, height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 15, flexShrink: 0,
        color: 'var(--c-text-4)',
        ...(floating ? { position: 'fixed', top: 16, right: 16, zIndex: 10 } : {}),
      }}
    >
      {theme === 'dark' ? '☀' : '☽'}
    </button>
  )
}

function Noise() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      opacity: 'var(--c-noise-opacity)' as unknown as number,
    }} />
  )
}

function Grid() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: 'linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)',
      backgroundSize: '52px 52px',
    }} />
  )
}

function Glow() {
  return (
    <div style={{
      position: 'fixed', top: -180, left: '50%', transform: 'translateX(-50%)',
      width: 700, height: 500, borderRadius: '50%',
      zIndex: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
      opacity: 'var(--c-glow-opacity)' as unknown as number,
      animation: 'glow-pulse 4s ease-in-out infinite',
    }} />
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const root: React.CSSProperties = {
  minHeight: '100vh', height: '100vh',
  background: 'var(--c-bg)', color: 'var(--c-text)',
  fontFamily: 'var(--font-body)',
  position: 'relative', overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
}

const landing: React.CSSProperties = {
  position: 'relative', zIndex: 1,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: '100vh', padding: 40, textAlign: 'center',
  overflowY: 'auto',
}

const heroTagline: React.CSSProperties = {
  fontSize: 'clamp(24px, 3.5vw, 42px)',
  fontWeight: 300, letterSpacing: '-0.02em',
  color: 'var(--c-text)', fontFamily: 'var(--font-display)',
  lineHeight: 1.15, marginBottom: 14,
}

const heroSub: React.CSSProperties = {
  fontSize: 15, color: 'var(--c-text-4)',
  fontFamily: 'var(--font-body)', lineHeight: 1.75, fontWeight: 400, margin: 0,
}

const ctaBtn: React.CSSProperties = {
  marginTop: 4, padding: '14px 44px',
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: '#fff', border: 'none', borderRadius: 999,
  fontSize: 15, fontFamily: 'var(--font-data)',
  fontWeight: 600, letterSpacing: 0.5, cursor: 'pointer',
  boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 0 80px rgba(99,102,241,0.15)',
  width: '100%', maxWidth: 280,
}

const pillsRow: React.CSSProperties = {
  display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
}

const featurePill: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 999,
  background: 'var(--c-surface-2)',
  color: 'var(--c-text-4)', fontSize: 12,
  fontFamily: 'var(--font-data)', fontWeight: 500,
}

const commandCard: React.CSSProperties = {
  background: 'rgba(37,37,45,0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(163,166,255,0.12)',
  borderRadius: 12, padding: '18px 24px',
  maxWidth: 480, textAlign: 'left', width: '100%',
}

const commandCardLabel: React.CSSProperties = {
  fontSize: 9, color: 'var(--c-primary)', letterSpacing: 2,
  fontFamily: 'var(--font-data)', fontWeight: 600, marginBottom: 8,
}

const commandCardText: React.CSSProperties = {
  color: 'var(--c-text-4)', fontSize: 13,
  fontFamily: 'var(--font-body)', lineHeight: 1.7, margin: 0,
}

const codeSnippet: React.CSSProperties = {
  color: '#a3a6ff', background: 'rgba(163,166,255,0.1)',
  border: '1px solid rgba(163,166,255,0.2)',
  borderRadius: 4, padding: '1px 6px', fontSize: 12,
  fontFamily: 'var(--font-data)',
}

const chainsRow: React.CSSProperties = {
  display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4,
}

const chainItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6 }

const chainLabel: React.CSSProperties = {
  fontSize: 11, color: 'var(--c-text-5)',
  fontFamily: 'var(--font-data)', fontWeight: 500,
}

const loadSpinner: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366F1',
  animation: 'spin 0.9s linear infinite',
}

const errorCard: React.CSSProperties = {
  background: 'rgba(255,110,132,0.08)',
  border: '1px solid rgba(255,110,132,0.2)',
  borderRadius: 10, padding: '14px 20px', maxWidth: 360,
}

// App chrome
const appHeader: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 20px',
  background: 'var(--c-header)', backdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--c-border-2)', flexShrink: 0,
}

const ensName: React.CSSProperties = {
  fontSize: 12, color: '#6366F1',
  fontFamily: 'var(--font-data)', fontWeight: 500,
}

const worthBar: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '14px 22px', flexShrink: 0,
  background: 'var(--c-bg-alt)', borderBottom: '1px solid var(--c-border-2)',
}

const worthBarMobile: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  padding: '12px 16px', flexShrink: 0,
  background: 'var(--c-bg-alt)', borderBottom: '1px solid var(--c-border-2)',
}

const barLabel: React.CSSProperties = {
  fontSize: 9, color: 'var(--c-text-6)',
  letterSpacing: 2, marginBottom: 4,
  fontFamily: 'var(--font-data)', fontWeight: 500,
}

const barValue: React.CSSProperties = {
  color: 'var(--c-text-4)', fontSize: 13,
  fontFamily: 'var(--font-data)', marginTop: 2,
}

const barValueBold: React.CSSProperties = {
  color: 'var(--c-text)', fontSize: 16,
  fontFamily: 'var(--font-data)', fontWeight: 600, marginTop: 2,
}

const worthValue: React.CSSProperties = {
  fontSize: 26, fontWeight: 600, color: 'var(--c-text)',
  fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', marginTop: 2,
}

const refreshButton: React.CSSProperties = {
  padding: '5px 12px',
  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
  borderRadius: 999, color: '#a3a6ff',
  fontSize: 11, fontFamily: 'var(--font-data)', letterSpacing: 0.5, cursor: 'pointer',
}

const snapLabel: React.CSSProperties = {
  fontSize: 9, color: 'var(--c-text-7)', fontFamily: 'var(--font-data)',
}

const refreshErrStyle: React.CSSProperties = {
  fontSize: 9, color: '#ff6e84', fontFamily: 'var(--font-data)', maxWidth: 140, textAlign: 'right',
}

const tabsBar: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  display: 'flex', flexShrink: 0,
  borderBottom: '1px solid var(--c-border-2)',
  background: 'var(--c-bg)',
}

const tabButton: React.CSSProperties = {
  flex: 1, padding: '11px 0',
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--c-text-5)', fontSize: 10, letterSpacing: 2,
  fontFamily: 'var(--font-data)', fontWeight: 600,
  borderBottom: '2px solid transparent', transition: 'all 0.2s',
}

const tabActive: React.CSSProperties = {
  color: '#a3a6ff', borderBottomColor: '#6366F1',
}

const contentArea: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
}

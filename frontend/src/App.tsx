import { useState, useEffect } from 'react'
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { ChatPanel } from './components/ChatPanel.js'
import { PortfolioPanel } from './components/PortfolioPanel.js'
import { fetchWallet } from './lib/api.js'
import type { WalletData } from './types/index.js'

type Tab = 'chat' | 'portfolio'

export default function App() {
  const { address, isConnected } = useAppKitAccount()
  const { open } = useAppKit()

  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('chat')

  // Fetch wallet data whenever address changes
  useEffect(() => {
    if (!address || !isConnected) {
      setWallet(null)
      return
    }
    setLoading(true)
    setError(null)
    fetchWallet(address)
      .then(setWallet)
      .catch(err => setError(err.message ?? 'Failed to load wallet'))
      .finally(() => setLoading(false))
  }, [address, isConnected])

  // ── Landing ────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={root}>
        <Noise />
        <Grid />
        <Glow />
        <div style={landing}>
          <Logo size="lg" />
          <p style={tagline}>On-chain intelligence, distilled.</p>
          <p style={sub}>Connect your wallet. Ask anything. Understand everything.</p>
          <button style={connectBtn} onClick={() => open()}>
            Connect Wallet →
          </button>
          <div style={pills}>
            {['Net Worth', 'Risk Analysis', 'Transaction Intel', 'AI Chat', 'Send ETH'].map(f => (
              <span key={f} style={pill}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Loading wallet data ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={root}>
        <Noise /><Grid />
        <div style={landing}>
          <Logo size="lg" />
          <div style={spinnerWrap}>
            <div style={spinner} />
            <p style={{ color: '#888', fontSize: 13, fontFamily: 'monospace', margin: 0 }}>
              Indexing {address?.slice(0, 8)}...
            </p>
          </div>
          <p style={{ color: '#444', fontSize: 11, fontFamily: 'monospace' }}>
            Fetching balances, tokens &amp; transactions
          </p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={root}>
        <Noise /><Grid />
        <div style={landing}>
          <Logo size="lg" />
          <p style={{ color: '#F87171', fontFamily: 'monospace', fontSize: 13 }}>{error}</p>
          <button style={connectBtn} onClick={() => open()}>Retry / Switch Wallet</button>
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
      <header style={header}>
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RiskBadge level={wallet.riskLevel} />
          {wallet.ensName && <span style={ens}>{wallet.ensName}</span>}
          {/* Reown built-in button handles disconnect/account */}
          <w3m-button size="sm" />
        </div>
      </header>

      {/* Net Worth Bar */}
      <div style={worthBar}>
        <div>
          <div style={label}>TOTAL NET WORTH</div>
          <div style={worthVal}>${wallet.netWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={label}>CHAIN</div>
          <div style={{ color: '#888', fontSize: 14, fontFamily: 'monospace', marginTop: 2 }}>
            {wallet.chain} · {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={label}>ETH</div>
          <div style={{ color: '#E8E8E0', fontSize: 18, fontWeight: 700, marginTop: 2 }}>
            {parseFloat(wallet.ethBalance).toFixed(4)} ETH
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabs}>
        {(['chat', 'portfolio'] as Tab[]).map(t => (
          <button key={t} style={{ ...tabBtn, ...(tab === t ? tabActive : {}) }} onClick={() => setTab(t)}>
            {t === 'chat' ? 'AI CHAT' : 'PORTFOLIO'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={content}>
        {tab === 'chat'
          ? <ChatPanel wallet={wallet} address={wallet.address} />
          : <PortfolioPanel wallet={wallet} />
        }
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Logo({ size }: { size: 'sm' | 'lg' }) {
  const fs = size === 'lg' ? { glyph: 52, text: 48, gap: 2, spacing: 10 } : { glyph: 20, text: 18, gap: 2, spacing: 6 }
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: fs.gap }}>
      <span style={{ fontSize: fs.glyph, fontWeight: 900, color: '#6366F1', lineHeight: 1, fontFamily: 'serif' }}>⌀</span>
      <span style={{ fontSize: fs.text, fontWeight: 800, letterSpacing: fs.spacing, color: '#E8E8E0', fontFamily: "'IBM Plex Mono', monospace" }}>RACLE</span>
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

function Noise() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />
}
function Grid() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
}
function Glow() {
  return <div style={{ position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
}

// ── Styles ────────────────────────────────────────────────────────────────────

const root: React.CSSProperties = {
  minHeight: '100vh', height: '100vh',
  background: '#080A0F', color: '#E8E8E0',
  fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  position: 'relative', overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
}
const landing: React.CSSProperties = {
  position: 'relative', zIndex: 1,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: '100vh', gap: 24, padding: 32, textAlign: 'center',
}
const tagline: React.CSSProperties = { fontSize: 20, color: '#A0A0A0', fontWeight: 300, letterSpacing: 3, margin: 0 }
const sub: React.CSSProperties = { fontSize: 14, color: '#555', maxWidth: 420, lineHeight: 1.8, margin: 0 }
const connectBtn: React.CSSProperties = {
  marginTop: 8, padding: '14px 40px',
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 15, fontFamily: "'IBM Plex Mono', monospace",
  fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
  boxShadow: '0 0 40px rgba(99,102,241,0.3)',
}
const pills: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }
const pill: React.CSSProperties = {
  padding: '4px 14px', borderRadius: 20,
  border: '1px solid rgba(99,102,241,0.3)',
  color: '#6366F1', fontSize: 11, letterSpacing: 1,
}
const spinnerWrap: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14 }
const spinner: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%',
  border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366F1',
  animation: 'spin 0.8s linear infinite',
}
const header: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '14px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  background: 'rgba(8,10,15,0.95)', backdropFilter: 'blur(10px)',
  flexShrink: 0,
}
const ens: React.CSSProperties = { fontSize: 12, color: '#6366F1', fontFamily: 'monospace' }
const worthBar: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 24px', flexShrink: 0,
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  background: 'rgba(255,255,255,0.015)',
}
const label: React.CSSProperties = { fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 4 }
const worthVal: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: -1, color: '#E8E8E0' }
const tabs: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  display: 'flex', flexShrink: 0,
  borderBottom: '1px solid rgba(255,255,255,0.05)',
}
const tabBtn: React.CSSProperties = {
  flex: 1, padding: '11px 0',
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: '#555', fontSize: 11, letterSpacing: 2,
  fontFamily: "'IBM Plex Mono', monospace",
  borderBottom: '2px solid transparent', transition: 'all 0.2s',
}
const tabActive: React.CSSProperties = { color: '#6366F1', borderBottomColor: '#6366F1' }
const content: React.CSSProperties = {
  position: 'relative', zIndex: 2,
  flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
}

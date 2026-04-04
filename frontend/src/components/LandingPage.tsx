import { useTheme } from '../lib/theme.js'

const EVM_CHAINS = [
  { name: 'Ethereum', color: '#627EEA' },
  { name: 'Base',     color: '#0052FF' },
  { name: 'Arbitrum', color: '#12AAFF' },
  { name: 'Optimism', color: '#FF0420' },
  { name: 'Polygon',  color: '#8247E5' },
  { name: 'zkSync',   color: '#8C8DFC' },
  { name: 'Avalanche',color: '#E84142' },
]

const FEATURES = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
        <path d="M8 1.5 A6.5 6.5 0 0 1 14.5 8 L8 8 Z" fill="currentColor"/>
      </svg>
    ),
    title: 'Multi-Chain Portfolio',
    desc: 'All assets across 7 EVM chains in one unified view.',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 14 L4 11 L7 11 Z" fill="currentColor"/>
        <circle cx="5" cy="7" r="1" fill="currentColor"/>
        <circle cx="8" cy="7" r="1" fill="currentColor"/>
        <circle cx="11" cy="7" r="1" fill="currentColor"/>
      </svg>
    ),
    title: 'Natural Language AI',
    desc: "Ask anything about your wallet in plain English.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 5 L13 5 M10 2 L13 5 L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 11 L3 11 M6 8 L3 11 L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Intent-Based Transfers',
    desc: 'Say "send 50 USDC to vitalik.eth" — ØRACLE handles the rest.',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M1.5 11.5 L5 7.5 L7.5 10 L11 5.5 L14.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14.5" cy="8" r="1" fill="currentColor"/>
      </svg>
    ),
    title: 'Market Intelligence',
    desc: 'Fear & Greed index, news sentiment, and macro context.',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 2 L14 5 L14 9 C14 12.3 11.3 15.3 8 16 C4.7 15.3 2 12.3 2 9 L2 5 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 8 L7.5 9.5 L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Risk Analysis',
    desc: 'Wallet risk scoring with concentration and exposure breakdown.',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 4.5 L8 8 L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Transaction History',
    desc: 'Full on-chain timeline across all chains, decoded.',
  },
]

// Sun / Moon icons matching Sidebar
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.4 3.6L11.3 4.7M4.7 11.3L3.6 12.4M12.4 12.4L11.3 11.3M4.7 4.7L3.6 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 9A5.5 5.5 0 0 1 7 2.5c0-.28.02-.56.06-.83A6.5 6.5 0 1 0 13.83 9.44 5.5 5.5 0 0 1 13.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

interface Props {
  onConnect: () => void
}

export function LandingPage({ onConnect }: Props) {
  const { theme, toggle } = useTheme()

  return (
    <div style={root}>

      {/* ── Nav ── */}
      <nav style={nav}>
        {/* Logo — mirrors Sidebar logo zone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>Ø</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>RACLE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle — same style as Sidebar's themeToggle */}
          <button onClick={toggle} style={themeBtn} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <span style={{ display: 'flex', color: 'var(--text-4)' }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>

          {/* CTA — matches dashboard's refreshTopBtn style */}
          <button style={connectBtn} onClick={onConnect}>Connect Wallet →</button>
        </div>
      </nav>

      {/* ── Body — centered, no scroll ── */}
      <div style={body}>

        {/* Eyebrow badge */}
        <div style={eyebrow}>
          <span style={eyebrowDot} />
          ON-CHAIN INTELLIGENCE
        </div>

        {/* Headline */}
        <h1 style={h1}>
          Your wallet.<br />
          <span style={h1Accent}>Understood.</span>
        </h1>

        {/* Subtitle */}
        <p style={sub}>
          Connect your wallet and instantly understand your entire on-chain footprint —
          balances, transactions, risk, and market context.
        </p>

        {/* CTA */}
        <button style={heroCta} onClick={onConnect}>
          Connect Wallet →
        </button>
        <p style={trustLine}>Non-custodial · Read-only until you send · No sign-up</p>

        {/* Feature grid — same card/border style as dashboard */}
        <div style={featureGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                ...featureCard,
                borderRight:  (i + 1) % 3 === 0 ? 'none' : `1px solid var(--border)`,
                borderBottom: i < 3 ? `1px solid var(--border)` : 'none',
              }}
            >
              <span style={{ color: 'var(--accent)', display: 'flex', marginBottom: 8 }}>{f.icon}</span>
              <div style={featureTitle}>{f.title}</div>
              <p style={featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Chain strip */}
        <div style={chainStrip}>
          {EVM_CHAINS.map((c, i) => (
            <span key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ width: 1, height: 10, background: 'var(--border-sub)', flexShrink: 0 }} />}
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-5)' }}>{c.name}</span>
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}

// ── Styles — mirrors dashboard CSS variables ──────────────────────────────────

const root: React.CSSProperties = {
  height: '100vh',
  overflow: 'hidden',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontFamily: 'Inter, system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  transition: 'background 0.2s ease, color 0.2s ease',
}

// Nav matches Sidebar logo zone: same height, border, bg
const nav: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
  height: 52,
  flexShrink: 0,
  borderBottom: '1px solid var(--sidebar-bd)',
  background: 'var(--sidebar-bg)',
}

// Theme toggle matches Sidebar's themeToggle
const themeBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  padding: '7px 8px',
  cursor: 'pointer',
  color: 'var(--text-4)',
  fontFamily: 'Inter, system-ui, sans-serif',
}

// Connect button matches refreshTopBtn from App
const connectBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 32,
  padding: '0 14px',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif',
  cursor: 'pointer',
  letterSpacing: '-0.01em',
}

const body: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 40px 24px',
  textAlign: 'center',
  overflow: 'hidden',
}

// Eyebrow pill — matches Sidebar's liveChip style
const eyebrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: 'var(--accent)',
  background: 'var(--accent-glow)',
  border: '1px solid var(--accent-bd)',
  borderRadius: 999,
  padding: '3px 12px',
  marginBottom: 20,
}

const eyebrowDot: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: 'var(--accent)',
  flexShrink: 0,
  animation: 'pulse-dot 2s ease-in-out infinite',
}

const h1: React.CSSProperties = {
  fontSize: 'clamp(32px, 4.5vw, 52px)',
  fontWeight: 600,
  color: 'var(--text)',
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: 16,
}

const h1Accent: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--accent) 0%, #A78BFA 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const sub: React.CSSProperties = {
  fontSize: 15,
  color: 'var(--text-4)',
  lineHeight: 1.65,
  maxWidth: 460,
  marginBottom: 24,
}

const heroCta: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  height: 40,
  padding: '0 24px',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif',
  cursor: 'pointer',
  marginBottom: 10,
  boxShadow: '0 0 24px var(--accent-glow)',
}

const trustLine: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-5)',
  marginBottom: 28,
}

// Feature grid — mirrors dashboard overview stat grid: bg-card + border + radius-8
const featureGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  width: '100%',
  maxWidth: 680,
  marginBottom: 24,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  overflow: 'hidden',
}

const featureCard: React.CSSProperties = {
  padding: '16px 18px',
  background: 'var(--bg-card)',
  textAlign: 'left',
}

// Label style matches dashboard's `lbl` — 9px uppercase tracking
const featureTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 4,
  letterSpacing: '-0.01em',
}

const featureDesc: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-5)',
  lineHeight: 1.55,
  margin: 0,
}

const chainStrip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  justifyContent: 'center',
}

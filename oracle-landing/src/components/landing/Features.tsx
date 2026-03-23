import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const FEATURES = [
  {
    icon: <WalletIcon />, color: 'var(--accent)',
    title: 'Unified Net Worth',
    desc: 'Total portfolio value across ETH, ERC-20 tokens, and DeFi positions in a single number. No more tab switching.',
  },
  {
    icon: <ChatIcon />, color: 'var(--accent3)',
    title: 'AI Chat Interface',
    desc: 'Ask plain English questions. "Where is most of my money?" "What did I do last week?" Get sharp, instant answers.',
  },
  {
    icon: <RiskIcon />, color: 'var(--gold)',
    title: 'Risk Analysis',
    desc: 'Concentration risk, stablecoin allocation, volatile vs stable — all scored, explained, and actionable.',
  },
  {
    icon: <TxIcon />, color: 'var(--green)',
    title: 'Transaction Intelligence',
    desc: 'No more "Swap event on Uniswap." See "You swapped 0.5 ETH for 912 USDC yesterday" — every tx in plain language.',
  },
  {
    icon: <StarIcon />, color: 'var(--accent)',
    title: 'Smart Insights',
    desc: 'Proactive alerts before you ask. Portfolio shifts, concentration warnings, inactivity notices — all surfaced automatically.',
  },
  {
    icon: <SendIcon />, color: 'var(--accent2)',
    title: 'Send ETH via Chat',
    desc: 'Type "Send 0.1 ETH to 0x...". ØRACLE parses the intent, shows a confirmation, executes via your connected wallet.',
  },
]

export function Features() {
  const ref = useScrollReveal()

  return (
    <section id="features" className="landing-section-narrow" style={{ position: 'relative', zIndex: 1 }}>
      <div ref={ref} className="reveal-section">
        <div className="section-tag">// CAPABILITIES</div>
        <h2 style={h2Style}>Everything your wallet<br />has been missing.</h2>
        <p style={subStyle}>Six core intelligence modules that turn raw blockchain data into decisions you can act on.</p>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div
      className="feature-card"
      style={{
        background: 'var(--bg2)',
        padding: '44px 36px',
        transition: 'background 0.3s',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg3)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg2)'
      }}
    >
      <div style={{
        width: 48, height: 48,
        background: `rgba(${hexToRgb(color)},0.1)`,
        border: `1px solid rgba(${hexToRgb(color)},0.2)`,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        color,
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>{desc}</div>
    </div>
  )
}

// Rough hex→rgb for inline rgba usage (only needed for a few known colors)
function hexToRgb(v: string): string {
  const map: Record<string, string> = {
    'var(--accent)':  '124,109,250',
    'var(--accent2)': '167,139,250',
    'var(--accent3)': '56,189,248',
    'var(--gold)':    '245,158,11',
    'var(--green)':   '52,211,153',
  }
  return map[v] ?? '124,109,250'
}

// Icon components
function WalletIcon() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="5" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M15 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 9h18" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
}
function ChatIcon() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M4 18L8 13L12 15L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
  </svg>
}
function RiskIcon() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}
function TxIcon() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M4 6h14M4 11h10M4 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}
function StarIcon() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 3L13.5 8.5L20 9.3L15.5 13.5L16.8 20L11 17L5.2 20L6.5 13.5L2 9.3L8.5 8.5L11 3Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
}
function SendIcon() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M5 11h12M13 7l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(32px, 4vw, 52px)',
  fontWeight: 800, lineHeight: 1.1,
  letterSpacing: -1, marginBottom: 20,
}
const subStyle: React.CSSProperties = {
  fontSize: 15, color: 'var(--muted)',
  lineHeight: 1.8, maxWidth: 500, marginBottom: 72,
}

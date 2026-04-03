import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const FEATURES = [
  {
    icon: <WalletIcon />, colorKey: 'accent',
    title: 'Unified Net Worth',
    desc:  'Total portfolio value across ETH, ERC-20 tokens, and DeFi positions in a single number. No more tab switching.',
  },
  {
    icon: <ChatIcon />, colorKey: 'accent3',
    title: 'AI Chat Interface',
    desc:  'Ask plain English questions. "Where is most of my money?" "What did I do last week?" Get sharp, instant answers.',
  },
  {
    icon: <RiskIcon />, colorKey: 'gold',
    title: 'Risk Analysis',
    desc:  'Concentration risk, stablecoin allocation, volatile vs stable — all scored, explained, and actionable.',
  },
  {
    icon: <TxIcon />, colorKey: 'green',
    title: 'Transaction Intelligence',
    desc:  'No more "Swap event on Uniswap." See "You swapped 0.5 ETH for 912 USDC yesterday" — every tx in plain language.',
  },
  {
    icon: <StarIcon />, colorKey: 'accent',
    title: 'Smart Insights',
    desc:  'Proactive alerts before you ask. Portfolio shifts, concentration warnings, inactivity notices — surfaced automatically.',
  },
  {
    icon: <SendIcon />, colorKey: 'accent2',
    title: 'Send ETH via Chat',
    desc:  'Type "Send 0.1 ETH to 0x…". ØRACLE parses the intent, shows a full preview, and executes via your connected wallet.',
  },
]

// CSS var values for RGBA generation
const COLOR_RGBA: Record<string, { r: number; g: number; b: number }> = {
  accent:  { r: 124, g: 109, b: 250 },
  accent2: { r: 167, g: 139, b: 250 },
  accent3: { r: 56,  g: 189, b: 248 },
  gold:    { r: 245, g: 158, b: 11  },
  green:   { r: 52,  g: 211, b: 153 },
}

function rgba(key: string, alpha: number) {
  const c = COLOR_RGBA[key] ?? COLOR_RGBA['accent']
  return `rgba(${c.r},${c.g},${c.b},${alpha})`
}

export function Features() {
  const ref = useScrollReveal()

  return (
    <section id="features" className="landing-section-narrow" style={{ position: 'relative', zIndex: 1 }}>
      <div ref={ref} className="reveal-section">
        <div className="section-tag">// CAPABILITIES</div>
        <h2 style={h2Style}>Everything your wallet<br />has been missing.</h2>
        <p style={subStyle}>
          Six core intelligence modules that turn raw blockchain data into decisions you can act on.
        </p>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon:     React.ReactNode
  colorKey: string
  title:    string
  desc:     string
}

function FeatureCard({ icon, colorKey, title, desc }: FeatureCardProps) {
  const cssVar = `var(--${colorKey})`

  return (
    <div
      className="feature-card"
      style={{
        background:     'var(--bg2)',
        padding:        '44px 36px',
        position:       'relative',
        overflow:       'hidden',
        transition:     'background 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'var(--bg3)'
        const bar = el.querySelector('.feature-top-bar') as HTMLElement | null
        if (bar) bar.style.opacity = '1'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'var(--bg2)'
        const bar = el.querySelector('.feature-top-bar') as HTMLElement | null
        if (bar) bar.style.opacity = '0'
      }}
    >
      {/* Top accent bar on hover */}
      <div
        className="feature-top-bar"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     2,
          background: `linear-gradient(90deg, ${rgba(colorKey, 0)}, ${cssVar}, ${rgba(colorKey, 0)})`,
          opacity:    0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width:           48,
          height:          48,
          background:      rgba(colorKey, 0.1),
          border:          `1px solid ${rgba(colorKey, 0.2)}`,
          borderRadius:    10,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    24,
          color:           cssVar,
          transition:      'background 0.3s, border-color 0.3s',
        }}
      >
        {icon}
      </div>

      <div style={{
        fontFamily:   'var(--font-display)',
        fontSize:     17,
        fontWeight:   700,
        marginBottom: 12,
        color:        'var(--text)',
        letterSpacing: -0.3,
      }}>
        {title}
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
        {desc}
      </div>
    </div>
  )
}

/* ── Icons (hand-crafted SVG) ── */

function WalletIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M4 18L8 13L12 15L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4"  cy="18" r="1.5" fill="currentColor" />
      <circle cx="18" cy="6"  r="1.5" fill="currentColor" />
    </svg>
  )
}

function RiskIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M4 6h14M4 11h10M4 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 3L13.5 8.5L20 9.3L15.5 13.5L16.8 20L11 17L5.2 20L6.5 13.5L2 9.3L8.5 8.5L11 3Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 11h12M13 7l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontSize:      'clamp(30px, 4vw, 52px)',
  fontWeight:    800,
  lineHeight:    1.1,
  letterSpacing: -1,
  marginBottom:  18,
  color:         'var(--text)',
}

const subStyle: React.CSSProperties = {
  fontSize:     15,
  color:        'var(--muted)',
  lineHeight:   1.8,
  maxWidth:     500,
  marginBottom: 72,
}

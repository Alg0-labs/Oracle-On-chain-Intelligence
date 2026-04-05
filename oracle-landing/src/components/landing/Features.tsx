import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

/* ── Mini mockup components ── */

function NetWorthMockup() {
  return (
    <div style={{ background: 'rgba(124,109,250,0.06)', border: '1px solid rgba(124,109,250,0.15)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: '#6B7280', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 6 }}>NET WORTH</div>
      <div style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #c0c1ff, #8083ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: 4 }}>$48,320</div>
      <div style={{ fontSize: 11, color: '#34D399', fontFamily: 'DM Mono, monospace' }}>▲ +2.4% today</div>
    </div>
  )
}

function ChatMockup() {
  return (
    <div style={{ background: 'rgba(12,15,26,0.8)', border: '1px solid rgba(124,109,250,0.15)', borderRadius: 8, padding: '12px', marginBottom: 20, fontSize: 11 }}>
      <div style={{ background: 'rgba(124,109,250,0.13)', border: '1px solid rgba(124,109,250,0.2)', borderRadius: '6px 2px 6px 6px', padding: '8px 10px', color: '#E8E6FF', marginBottom: 8, fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.5 }}>
        What's my biggest risk?
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2px 6px 6px 6px', padding: '8px 10px', color: '#E8E6FF', fontFamily: 'DM Mono, monospace', lineHeight: 1.65 }}>
        <span style={{ color: '#7C6DFA', fontSize: 9, display: 'block', marginBottom: 4, letterSpacing: '0.1em' }}>ØRACLE</span>
        ETH is 64.6% of your portfolio — significant concentration risk...
      </div>
    </div>
  )
}

function RiskMockup() {
  return (
    <div style={{ background: 'rgba(12,15,26,0.8)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#E8E6FF', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>Risk Score</span>
        <span style={{ fontSize: 9, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 999, padding: '2px 8px', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>MEDIUM</span>
      </div>
      {[
        { label: 'ETH', pct: 64, color: '#7C6DFA' },
        { label: 'SOL', pct: 20, color: '#A78BFA' },
        { label: 'USDC', pct: 11, color: '#38BDF8' },
      ].map(b => (
        <div key={b.label} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#6B7280', fontFamily: 'DM Mono, monospace', marginBottom: 3 }}><span>{b.label}</span><span>{b.pct}%</span></div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TxMockup() {
  return (
    <div style={{ background: 'rgba(12,15,26,0.8)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 8, padding: '12px', marginBottom: 20 }}>
      {[
        { text: 'Swapped 0.5 ETH → 912 USDC', sub: 'Uniswap · 2h ago', color: '#38BDF8' },
        { text: 'Received 0.1 ETH', sub: 'From: 0x3f4A... · 5h ago', color: '#34D399' },
        { text: 'Sent 500 USDC', sub: 'To: vitalik.eth · 1d ago', color: '#A78BFA' },
      ].map((tx, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tx.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, color: '#E8E6FF', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>{tx.text}</div>
            <div style={{ fontSize: 9, color: '#6B7280', fontFamily: 'DM Mono, monospace' }}>{tx.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketMockup() {
  return (
    <div style={{ background: 'rgba(12,15,26,0.8)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: '#6B7280', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>FEAR & GREED</span>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#84CC16' }}>62</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ width: '62%', height: '100%', background: 'linear-gradient(90deg, #EF4444, #F59E0B, #84CC16)', borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#84CC16', fontFamily: 'DM Mono, monospace', textAlign: 'center' }}>GREED</div>
    </div>
  )
}

function SendMockup() {
  return (
    <div style={{ background: 'rgba(12,15,26,0.8)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: '#6B7280', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
        send 0.5 ETH to vitalik.eth
      </div>
      <div style={{ fontSize: 10, color: '#6B7280', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>AMOUNT</span><span style={{ color: '#E8E6FF' }}>0.5 ETH ($1,258)</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>GAS</span><span style={{ color: '#34D399' }}>~$2.40</span></div>
      </div>
      <div style={{ background: 'linear-gradient(135deg, #7C6DFA, #9B8BFF)', borderRadius: 6, padding: '8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif' }}>Confirm →</div>
    </div>
  )
}

/* ── Feature data ── */

const FEATURES = [
  {
    icon: <WalletIcon />, colorKey: 'accent',
    title: 'Unified Net Worth',
    desc: 'Total portfolio value across ETH, ERC-20s, and DeFi. One number, all chains.',
    mockup: <NetWorthMockup />,
  },
  {
    icon: <ChatIcon />, colorKey: 'accent3',
    title: 'AI Chat Interface',
    desc: 'Ask anything in plain English. Get answers from your actual on-chain data.',
    mockup: <ChatMockup />,
  },
  {
    icon: <RiskIcon />, colorKey: 'gold',
    title: 'Risk Analysis',
    desc: 'Concentration scoring, stablecoin buffer analysis, and volatility exposure.',
    mockup: <RiskMockup />,
  },
  {
    icon: <TxIcon />, colorKey: 'green',
    title: 'Transaction Intel',
    desc: "Every transaction decoded. No more 'Swap event on contract 0x...'.",
    mockup: <TxMockup />,
  },
  {
    icon: <MarketIcon />, colorKey: 'accent2',
    title: 'Market Intelligence',
    desc: 'Fear & Greed index, news sentiment, and macro context for your holdings.',
    mockup: <MarketMockup />,
  },
  {
    icon: <SendIcon />, colorKey: 'accent3',
    title: 'Send ETH via Chat',
    desc: 'Type intent. See preview. Confirm with wallet. Done in 10 seconds.',
    mockup: <SendMockup />,
  },
]

// CSS var values for RGBA generation — Stitch-aligned palette
const COLOR_RGBA: Record<string, { r: number; g: number; b: number }> = {
  accent:  { r: 192, g: 193, b: 255 },  // primary #c0c1ff
  accent2: { r: 128, g: 131, b: 255 },  // primary-container #8083ff
  accent3: { r: 74,  g: 225, b: 118 },  // secondary green #4ae176
  gold:    { r: 245, g: 158, b: 11  },
  green:   { r: 74,  g: 225, b: 118 },
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
  icon:      React.ReactNode
  colorKey:  string
  title:     string
  desc:      string
  mockup?:   React.ReactNode
}

function FeatureCard({ icon, colorKey, title, desc, mockup }: FeatureCardProps) {
  const cssVar = `var(--${colorKey})`

  return (
    <div
      className="feature-card"
      style={{
        background:     'var(--bg2)',
        padding:        '36px 32px',
        position:       'relative',
        overflow:       'hidden',
        transition:     'background 0.3s ease, box-shadow 0.3s ease',
        display:        'flex',
        flexDirection:  'column',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'var(--bg3)'
        el.style.boxShadow = `inset 0 0 40px ${rgba(colorKey, 0.06)}, 0 0 20px ${rgba(colorKey, 0.12)}`
        const bar = el.querySelector('.feature-top-bar') as HTMLElement | null
        if (bar) bar.style.opacity = '1'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'var(--bg2)'
        el.style.boxShadow = 'none'
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

      {/* Mini mockup preview — fixed height keeps all cards aligned */}
      {mockup && (
        <div style={{ height: 130, overflow: 'hidden', marginBottom: 20, borderRadius: 8 }}>
          <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
            {mockup}
          </div>
        </div>
      )}

      {/* Icon */}
      <div
        style={{
          width:          48,
          height:         48,
          background:     rgba(colorKey, 0.1),
          border:         `1px solid ${rgba(colorKey, 0.2)}`,
          borderRadius:   10,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginBottom:   20,
          color:          cssVar,
          transition:     'background 0.3s, border-color 0.3s',
        }}
      >
        {icon}
      </div>

      <div style={{
        fontFamily:    'var(--font-display)',
        fontSize:      17,
        fontWeight:    700,
        marginBottom:  12,
        color:         'var(--text)',
        letterSpacing: -0.3,
      }}>
        {title}
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, fontFamily: 'var(--font-body)' }}>
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

function MarketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 17l4-5 4 3 4-7 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  fontSize:      'clamp(30px, 4vw, 56px)',
  fontWeight:    800,
  lineHeight:    1.06,
  letterSpacing: -1.5,
  marginBottom:  18,
  color:         'var(--text)',
}

const subStyle: React.CSSProperties = {
  fontSize:     15,
  color:        'var(--muted)',
  lineHeight:   1.8,
  maxWidth:     500,
  marginBottom: 72,
  fontFamily:   'var(--font-body)',
}

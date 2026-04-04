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
  { icon: '⬡', title: 'Cross-chain Balances', desc: 'ETH, ERC-20, and native tokens across 7+ chains in one view.' },
  { icon: '↑↓', title: 'Transaction Intel', desc: 'Every swap, send, and contract call decoded with context.' },
  { icon: '◎', title: 'Risk Analysis', desc: 'Concentration risk, stablecoin ratio, and exposure breakdown.' },
  { icon: '✦', title: 'AI Chat', desc: 'Ask anything about your wallet in plain English.' },
  { icon: '→', title: 'Send ETH & ERC-20', desc: 'Type "send 50 USDC to 0x…" — Oracle builds and sends the tx.' },
  { icon: '▦', title: 'Market Intelligence', desc: 'Fear & Greed index, news sentiment, and macro context.' },
]

interface Props {
  onConnect: () => void
}

export function LandingPage({ onConnect }: Props) {
  const { theme, toggle } = useTheme()

  return (
    <div style={root}>
      {/* Nav */}
      <nav style={nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#6366F1', letterSpacing: '-0.02em' }}>Ø</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>RACLE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggle} style={themeBtn} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀' : '☽'}
          </button>
          <button style={navCta} onClick={onConnect}>Connect Wallet</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={hero}>
        <div style={eyebrow}>On-chain intelligence</div>

        <h1 style={heroH1}>
          Your Wallet,<br />Explained.
        </h1>

        <p style={heroSub}>
          Connect your wallet and instantly understand your entire on-chain footprint — balances, transactions, risk, and market context — with AI you can ask anything.
        </p>

        <button style={heroCta} onClick={onConnect}>
          Connect Wallet →
        </button>

        <p style={heroNote}>Non-custodial · Read-only until you send · No sign-up</p>

        {/* Feature grid */}
        <div style={featureGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                ...featureCell,
                borderRight: (i + 1) % 3 === 0 ? 'none' : '1px solid var(--border)',
                borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={featureIcon}>{f.icon}</div>
              <div style={featureTitle}>{f.title}</div>
              <p style={featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Chain strip */}
        <div style={chainLabel}>Supported networks</div>
        <div style={chainStrip}>
          {EVM_CHAINS.map((c, i) => (
            <span key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {i > 0 && <span style={chainDivider} />}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={chainName}>{c.name}</span>
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={footer}>
        © {new Date().getFullYear()} Oracle Protocol · Non-custodial · Your keys, your crypto
      </footer>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const root: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontFamily: 'Inter, system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  transition: 'background 0.2s ease, color 0.2s ease',
}

const nav: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 40px',
  height: 60,
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  background: 'var(--bg)',
  zIndex: 10,
  transition: 'background 0.2s ease',
}

const themeBtn: React.CSSProperties = {
  background: 'var(--bg-subtle)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  width: 32, height: 32,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 14, color: 'var(--text-3)',
  transition: 'all 0.15s',
}

const navCta: React.CSSProperties = {
  background: 'var(--accent-dim)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  height: 36,
  padding: '0 16px',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif',
  cursor: 'pointer',
}

const hero: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '80px 40px 60px',
  maxWidth: 720,
  margin: '0 auto',
  width: '100%',
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  color: '#6366F1',
  background: 'rgba(99,102,241,0.1)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 999,
  padding: '4px 14px',
  marginBottom: 24,
  textTransform: 'uppercase' as const,
}

const heroH1: React.CSSProperties = {
  fontSize: 'clamp(36px, 5vw, 56px)',
  fontWeight: 600,
  color: 'var(--text)',
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: 20,
}

const heroSub: React.CSSProperties = {
  fontSize: 17,
  color: 'var(--text-4)',
  lineHeight: 1.65,
  maxWidth: 480,
  marginBottom: 32,
}

const heroCta: React.CSSProperties = {
  background: 'var(--accent-dim)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  height: 44,
  padding: '0 28px',
  fontSize: 15,
  fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif',
  cursor: 'pointer',
  marginBottom: 14,
  boxShadow: '0 0 32px rgba(99,102,241,0.25)',
}

const heroNote: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-5)',
  marginBottom: 60,
}

const featureGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  width: '100%',
  marginBottom: 48,
  border: '1px solid var(--border)',
  borderRadius: 10,
  overflow: 'hidden',
}

const featureCell: React.CSSProperties = {
  padding: '22px 20px',
  background: 'var(--bg-subtle)',
  textAlign: 'left',
}

const featureIcon: React.CSSProperties = {
  fontSize: 16,
  color: '#6366F1',
  marginBottom: 10,
  fontFamily: 'monospace',
}

const featureTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 6,
  letterSpacing: '-0.01em',
}

const featureDesc: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-4)',
  lineHeight: 1.6,
  margin: 0,
}

const chainLabel: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-5)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  marginBottom: 14,
}

const chainStrip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
  gap: 4,
}

const chainDivider: React.CSSProperties = {
  width: 1,
  height: 10,
  background: 'var(--border-sub)',
}

const chainName: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-4)',
}

const footer: React.CSSProperties = {
  textAlign: 'center',
  padding: '24px',
  fontSize: 11,
  color: 'var(--text-6)',
  marginTop: 'auto',
  borderTop: '1px solid var(--border)',
}

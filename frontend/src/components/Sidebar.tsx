import type { WalletData } from '../types/index.js'

export type Page = 'overview' | 'portfolio' | 'chat' | 'transactions' | 'market'

// ── Icons (inline SVG for zero-dep) ──────────────────────────────────────────
const Icons: Record<string, React.ReactNode> = {
  overview: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/>
    </svg>
  ),
  portfolio: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
      <path d="M8 1.5 A6.5 6.5 0 0 1 14.5 8 L8 8 Z" fill="currentColor"/>
    </svg>
  ),
  chat: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 14 L4 11 L7 11 Z" fill="currentColor"/>
      <circle cx="5" cy="7" r="1" fill="currentColor"/>
      <circle cx="8" cy="7" r="1" fill="currentColor"/>
      <circle cx="11" cy="7" r="1" fill="currentColor"/>
    </svg>
  ),
  transactions: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 5 L13 5 M10 2 L13 5 L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 11 L3 11 M6 8 L3 11 L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  market: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 11.5 L5 7.5 L7.5 10 L11 5.5 L14.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="14.5" cy="8" r="1" fill="currentColor"/>
    </svg>
  ),
  sun: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.4 3.6L11.3 4.7M4.7 11.3L3.6 12.4M12.4 12.4L11.3 11.3M4.7 4.7L3.6 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  moon: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 9A5.5 5.5 0 0 1 7 2.5c0-.28.02-.56.06-.83A6.5 6.5 0 1 0 13.83 9.44 5.5 5.5 0 0 1 13.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

interface NavItem { id: Page; label: string; section: 'MAIN' | 'INTEL' }

const NAV: NavItem[] = [
  { id: 'overview',     label: 'Overview',           section: 'MAIN' },
  { id: 'portfolio',    label: 'Portfolio',           section: 'MAIN' },
  { id: 'chat',         label: 'AI Assistant',        section: 'MAIN' },
  { id: 'transactions', label: 'Transactions',        section: 'MAIN' },
  { id: 'market',       label: 'Market Intel',        section: 'INTEL' },
]

interface Props {
  page: Page
  setPage: (p: Page) => void
  wallet: WalletData | null
  address: string | undefined
  theme: string
  onToggleTheme: () => void
}

export function Sidebar({ page, setPage, wallet, address, theme, onToggleTheme }: Props) {
  const risk    = wallet?.riskLevel ?? 'LOW'
  const riskClr = risk === 'LOW' ? '#22C55E' : risk === 'HIGH' ? '#EF4444' : '#F59E0B'
  const display = wallet?.ensName ?? (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '')

  return (
    <aside style={sidebar}>

      {/* ── Logo zone ── */}
      <div style={logoZone}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={logoO}>Ø</span>
          <span style={logoRacle}>RACLE</span>
        </div>
        {/* Live indicator */}
        <div style={liveChip}>
          <span style={liveDot} />
          <span style={liveLabel}>LIVE</span>
        </div>
      </div>

      {/* ── Wallet chip ── */}
      {address && (
        <div style={walletChip}>
          <div style={avatar}>{display.slice(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={walletName}>{display}</div>
            <div style={walletAddr}>{address.slice(0, 6)}…{address.slice(-4)}</div>
          </div>
          {wallet && (
            <span style={{ ...riskBadge, color: riskClr, background: `${riskClr}15`, borderColor: `${riskClr}28` }}>
              {risk}
            </span>
          )}
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={nav}>
        {(['MAIN', 'INTEL'] as const).map(section => (
          <div key={section} style={{ marginTop: 20 }}>
            <div style={sectionLbl}>{section}</div>
            {NAV.filter(n => n.section === section).map(item => {
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  style={{ ...navItem, ...(active ? navActive : {}) }}
                  onClick={() => setPage(item.id)}
                >
                  {active && <span style={activeBar} />}
                  <span style={{ color: active ? 'var(--accent)' : 'var(--text-4)', flexShrink: 0, display: 'flex' }}>
                    {Icons[item.id]}
                  </span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom zone: w3m-button + theme toggle ── */}
      <div style={bottomZone}>

        {/* Theme toggle */}
        <button style={themeToggle} onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <span style={{ display: 'flex', color: 'var(--text-4)' }}>
            {theme === 'dark' ? Icons.sun : Icons.moon}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>

      </div>
    </aside>
  )
}

// ── Styles (CSS-var-aware for theming) ─────────────────────────────────────────

const sidebar: React.CSSProperties = {
  width: 220,
  flexShrink: 0,
  height: '100vh',
  background: 'var(--sidebar-bg)',
  borderRight: '1px solid var(--sidebar-bd)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 10,
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const logoZone: React.CSSProperties = {
  height: 52,
  borderBottom: '1px solid var(--sidebar-bd)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  flexShrink: 0,
}

const logoO: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#6366F1',
  lineHeight: 1,
  letterSpacing: '-0.02em',
}

const logoRacle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--text)',
  lineHeight: 1,
  letterSpacing: '-0.02em',
}

const liveChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  background: 'rgba(34,197,94,0.08)',
  border: '1px solid rgba(34,197,94,0.2)',
  borderRadius: 999,
  padding: '2px 8px',
}

const liveDot: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: '#22C55E',
  boxShadow: '0 0 4px #22C55E',
  flexShrink: 0,
  animation: 'pulse-dot 2s ease-in-out infinite',
}

const liveLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: '#22C55E',
}

const walletChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  margin: '12px 10px 0',
  padding: '10px',
  background: 'var(--bg-muted)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const avatar: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  background: 'rgba(99,102,241,0.15)',
  border: '1px solid rgba(99,102,241,0.25)',
  color: '#818CF8',
  fontSize: 10,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const walletName: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const walletAddr: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--text-5)',
  fontFamily: 'var(--font-mono)',
  marginTop: 1,
}

const riskBadge: React.CSSProperties = {
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: '0.08em',
  border: '1px solid',
  borderRadius: 999,
  padding: '2px 6px',
  flexShrink: 0,
}

const nav: React.CSSProperties = {
  flex: 1,
  padding: '0 8px',
  overflowY: 'auto',
}

const sectionLbl: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'var(--text-6)',
  padding: '0 8px',
  marginBottom: 2,
}

const navItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  width: '100%',
  height: 36,
  padding: '0 8px',
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  color: 'var(--text-4)',
  fontSize: 13,
  fontWeight: 400,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  position: 'relative',
  fontFamily: 'var(--font-body)',
}

const navActive: React.CSSProperties = {
  background: 'var(--bg-muted)',
  color: 'var(--text)',
  fontWeight: 500,
}

const activeBar: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 2,
  height: 16,
  background: '#6366F1',
  borderRadius: 2,
}

const bottomZone: React.CSSProperties = {
  padding: '12px 10px',
  borderTop: '1px solid var(--sidebar-bd)',
  flexShrink: 0,
}

const themeToggle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  padding: '7px 8px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.15s',
}

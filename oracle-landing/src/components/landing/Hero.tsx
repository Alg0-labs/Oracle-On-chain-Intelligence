import React from 'react'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      {/* Content block */}
      <div className={styles.content}>
        {/* Live badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Live on Mainnet</span>
        </div>

        <h1 className={styles.h1}>
          Your wallet,<br />
          <span className={styles.gradient}>finally understood.</span>
        </h1>

        <p className={styles.sub}>
          ØRACLE is an AI intelligence layer for your crypto wallet.
          Connect once. Ask anything in plain English. Understand everything.
        </p>

        <div className={styles.actions}>
          <a href="https://app.oracleprotocol.online" className={styles.btnPrimary}>
            Connect Wallet →
          </a>
        </div>

        <p className={styles.trustLine}>Non-custodial · Read-only · No signup required</p>
      </div>

      {/* Dashboard mockup */}
      <div className={styles.mockupWrap}>
        <div className={styles.mockupGlow} />
        <DashboardMockup />
      </div>
    </section>
  )
}

/* ── Dashboard Mockup ── */

const mockupShell: React.CSSProperties = {
  width: 1100,
  height: 580,
  display: 'flex',
  background: '#09090B',
  border: '1px solid #1E1E2A',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 60px 120px rgba(0,0,0,0.7)',
  position: 'relative',
  zIndex: 1,
}

const sidebar: React.CSSProperties = {
  width: 220,
  background: '#0D0D12',
  borderRight: '1px solid #1E1E2A',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
}

const sidebarLogoRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  height: 52,
  borderBottom: '1px solid #1E1E2A',
  marginBottom: 0,
  flexShrink: 0,
}

const livePill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  background: 'rgba(34,197,94,0.08)',
  border: '1px solid rgba(34,197,94,0.2)',
  borderRadius: 999,
  padding: '2px 8px',
}

const liveGreenDot: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: '#22C55E',
  flexShrink: 0,
  boxShadow: '0 0 4px #22C55E',
  animation: 'pulse-dot 2s ease-in-out infinite',
}

const walletChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  margin: '12px 10px 0',
  padding: '10px',
  background: '#18181F',
  border: '1px solid #1E1E2A',
  borderRadius: 8,
}

const avatar: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  background: 'rgba(99,102,241,0.15)',
  border: '1px solid rgba(99,102,241,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 700,
  color: '#818CF8',
  flexShrink: 0,
}

const mediumBadge: React.CSSProperties = {
  fontSize: 8,
  fontWeight: 700,
  color: '#F59E0B',
  background: 'rgba(245,158,11,0.1)',
  border: '1px solid rgba(245,158,11,0.2)',
  borderRadius: 999,
  padding: '1px 5px',
  flexShrink: 0,
}

const mainArea: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const topBar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  height: 52,
  borderBottom: '1px solid #1E1E2A',
  flexShrink: 0,
}

const refreshBtn: React.CSSProperties = {
  fontSize: 11,
  color: '#71717A',
  background: '#18181F',
  border: '1px solid #27272F',
  borderRadius: 6,
  padding: '4px 10px',
  cursor: 'default',
}

const contentBody: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const netWorthCard: React.CSSProperties = {
  background: '#18181F',
  border: '1px solid #1E1E2A',
  borderRadius: 8,
  padding: '16px 18px',
  flexShrink: 0,
}

const statCardsRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexShrink: 0,
}

const statCard: React.CSSProperties = {
  flex: 1,
  background: '#18181F',
  border: '1px solid #1E1E2A',
  borderRadius: 8,
  padding: '10px 14px',
}

const statCardLabel: React.CSSProperties = {
  fontSize: 9,
  color: '#71717A',
  letterSpacing: '0.08em',
  marginBottom: 4,
  textTransform: 'uppercase' as const,
}

const statCardValue: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#FAFAFA',
}

const tokenSection: React.CSSProperties = {
  background: '#18181F',
  border: '1px solid #1E1E2A',
  borderRadius: 8,
  padding: '12px 14px',
  flex: 1,
}

const tokenRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '7px 0',
  borderBottom: '1px solid #1E1E2A',
}

const tokenIcon: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'rgba(99,102,241,0.12)',
  border: '1px solid rgba(99,102,241,0.22)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 700,
  color: '#818CF8',
  flexShrink: 0,
}

const rightPanel: React.CSSProperties = {
  width: 200,
  background: '#0D0D12',
  borderLeft: '1px solid #1E1E2A',
  padding: 16,
  flexShrink: 0,
  overflowY: 'auto',
}

function DashboardMockup() {
  return (
    <div style={mockupShell}>
      {/* Left sidebar */}
      <div style={sidebar}>
        <div style={sidebarLogoRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#6366F1', letterSpacing: '-0.02em', lineHeight: 1 }}>Ø</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1 }}>RACLE</span>
          </div>
          <div style={livePill}>
            <span style={liveGreenDot} />
            <span style={{ fontSize: 9, fontWeight: 700, color: '#22C55E', letterSpacing: '0.1em' }}>LIVE</span>
          </div>
        </div>
        <div style={walletChip}>
          <div style={avatar}>SU</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#FAFAFA', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>0x3f4A…8c2E</div>
            <div style={{ fontSize: 10, color: '#52525B', marginTop: 1 }}>0x3f4A…8c2E</div>
          </div>
          <span style={mediumBadge}>MED</span>
        </div>
        <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' as const, marginTop: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#3F3F46', padding: '0 8px', marginBottom: 2, textTransform: 'uppercase' as const }}>Main</div>
          {[
            { id: 'overview',     label: 'Overview',      active: true  },
            { id: 'portfolio',    label: 'Portfolio',     active: false },
            { id: 'chat',         label: 'AI Assistant',  active: false },
            { id: 'transactions', label: 'Transactions',  active: false },
          ].map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, height: 36, padding: '0 8px', borderRadius: 6, background: item.active ? '#18181F' : 'transparent', color: item.active ? '#FAFAFA' : '#71717A', fontSize: 13, fontWeight: item.active ? 500 : 400, position: 'relative', marginBottom: 1 }}>
              {item.active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: 16, background: '#6366F1', borderRadius: 2 }} />}
              {item.label}
            </div>
          ))}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#3F3F46', padding: '0 8px', margin: '20px 0 2px', textTransform: 'uppercase' as const }}>Intel</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 36, padding: '0 8px', borderRadius: 6, color: '#71717A', fontSize: 13 }}>Market Intel</div>
        </nav>
      </div>

      {/* Main area */}
      <div style={mainArea}>
        <div style={topBar}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em' }}>Overview</div>
          <button style={refreshBtn}>↻ Refresh</button>
        </div>
        <div style={contentBody}>
          {/* Net worth */}
          <div style={netWorthCard}>
            <div style={{ fontSize: 9, color: '#71717A', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' as const }}>Total Net Worth</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-1.5px', lineHeight: 1 }}>$48,320</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: '#22C55E' }}>▲ +$2,891 (6.4%)</span>
              <span style={{ fontSize: 11, color: '#71717A' }}>24h</span>
            </div>
            <svg width="200" height="40" viewBox="0 0 200 40" style={{ marginTop: 14 }}>
              <polyline points="0,35 30,28 60,20 90,25 120,12 150,18 200,8" fill="none" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="0,35 30,28 60,20 90,25 120,12 150,18 200,8 200,40 0,40" fill="url(#sparkGrad)" opacity="0.3" />
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Stat cards */}
          <div style={statCardsRow}>
            <div style={statCard}><div style={statCardLabel}>Assets</div><div style={statCardValue}>14</div></div>
            <div style={statCard}><div style={statCardLabel}>Chains</div><div style={statCardValue}>4</div></div>
            <div style={statCard}><div style={statCardLabel}>Risk</div><div style={{ ...statCardValue, color: '#F59E0B' }}>MED</div></div>
          </div>

          {/* Token list */}
          <div style={tokenSection}>
            <div style={{ fontSize: 9, color: '#71717A', letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase' as const }}>Holdings</div>
            {[
              { sym: 'ETH',  amount: '12.4 Ξ',  value: '$31,200', change: '+1.2%', up: true  },
              { sym: 'SOL',  amount: '88 SOL',   value: '$9,680',  change: '-0.8%', up: false },
              { sym: 'USDC', amount: '5,420',    value: '$5,420',  change: '+0.0%', up: true  },
              { sym: 'ARB',  amount: '3,210',    value: '$2,020',  change: '-2.1%', up: false },
            ].map((t, idx, arr) => (
              <div key={t.sym} style={{ ...tokenRow, borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #1E1E2A' }}>
                <div style={tokenIcon}>{t.sym[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA' }}>{t.sym}</div>
                  <div style={{ fontSize: 10, color: '#71717A', marginTop: 1 }}>{t.amount}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA' }}>{t.value}</div>
                  <div style={{ fontSize: 10, color: t.up ? '#22C55E' : '#EF4444', marginTop: 1 }}>{t.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={rightPanel}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#71717A', marginBottom: 14, textTransform: 'uppercase' as const }}>Risk Analysis</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>Portfolio Risk</div>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 999, padding: '2px 8px' }}>MEDIUM</span>
        </div>
        {[
          { label: 'ETH',  pct: 64.6, color: '#6366F1' },
          { label: 'SOL',  pct: 20.0, color: '#818CF8' },
          { label: 'USDC', pct: 11.2, color: '#38BDF8' },
          { label: 'ARB',  pct: 4.2,  color: '#22C55E' },
        ].map(b => (
          <div key={b.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#71717A', marginBottom: 4 }}>
              <span>{b.label}</span><span>{b.pct}%</span>
            </div>
            <div style={{ height: 4, background: '#1E1E2A', borderRadius: 3 }}>
              <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

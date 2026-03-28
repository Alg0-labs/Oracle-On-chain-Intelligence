import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function StatsBand() {
  const ref = useScrollReveal()
  const stats = [
    { val: '$2.4B+', label: 'TOTAL VALUE TRACKED' },
    { val: '840K+',  label: 'QUERIES ANSWERED' },
    { val: '12',     label: 'CHAINS SUPPORTED' },
    { val: '99.9%',  label: 'UPTIME SLA' },
  ]

  return (
    <div ref={ref} className="reveal-section" style={{
      padding: '80px 60px',
      background: 'linear-gradient(135deg, rgba(124,109,250,0.07) 0%, rgba(56,189,248,0.04) 100%)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{
        maxWidth: 1000, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 40, textAlign: 'center',
      }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 44, fontWeight: 800,
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 2, marginTop: 10 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RiskSection() {
  const leftRef  = useScrollReveal()
  const rightRef = useScrollReveal()

  const bars = [
    { label: 'ETH',  pct: 64.6, color: 'linear-gradient(90deg,#627EEA,#7C6DFA)' },
    { label: 'SOL',  pct: 20.0, color: '#9945FF' },
    { label: 'USDC', pct: 11.2, color: '#2775CA' },
    { label: 'ARB',  pct: 4.2,  color: '#12AAFF' },
  ]

  const tiers = [
    { label: 'LOW RISK',  desc: 'Diversified portfolio, healthy stablecoin buffer.',   color: 'var(--green)', bg: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.2)' },
    { label: 'MED RISK',  desc: 'Top holding exceeds 60% of portfolio.',               color: 'var(--gold)',  bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)' },
    { label: 'HIGH RISK', desc: 'Single asset over 80%. Extreme concentration.',       color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)' },
  ]

  return (
    <section className="landing-section" style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }} className="landing-grid-2">

        {/* Left: Risk card */}
        <div ref={leftRef} className="reveal-section">
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: 32,
            boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Portfolio Risk Analysis</div>
              <span style={{
                padding: '4px 12px', borderRadius: 4,
                fontSize: 11, letterSpacing: 1,
                background: 'rgba(245,158,11,0.1)',
                color: 'var(--gold)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}>MEDIUM RISK</span>
            </div>

            {bars.map(b => (
              <div key={b.label} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 7, letterSpacing: 1 }}>
                  <span>{b.label}</span><span>{b.pct}%</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 24, padding: 16,
              background: 'rgba(245,158,11,0.05)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 8, fontSize: 12, color: '#D4B483', lineHeight: 1.75,
            }}>
              ⚠ ETH is 64.6% of your portfolio. A 10% ETH decline would cost you $3,120. Consider rebalancing into stablecoins for downside protection.
            </div>
          </div>
        </div>

        {/* Right: explanation */}
        <div ref={rightRef} className="reveal-section">
          <div className="section-tag">// RISK ENGINE</div>
          <h2 style={h2Style}>Know your risk<br />before the<br />market does.</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, maxWidth: 440, marginBottom: 36 }}>
            ØRACLE continuously analyzes your concentration, stablecoin buffer, and
            volatility exposure. Get a plain-English risk score — not just raw numbers.
          </p>
          <div className="risk-tiers" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {tiers.map(t => (
              <div key={t.label} style={{
                padding: '18px 22px',
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 8, flex: 1, minWidth: 130,
              }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: t.color, lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(30px, 3.2vw, 48px)',
  fontWeight: 800, lineHeight: 1.1,
  letterSpacing: -1, marginBottom: 24,
}

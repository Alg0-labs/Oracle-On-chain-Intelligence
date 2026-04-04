import React, { useEffect, useRef } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

/* ─────────────────────────────────────────
   STATS BAND
───────────────────────────────────────── */
const STATS = [
  { val: '$2.4B+', label: 'TOTAL VALUE TRACKED' },
  { val: '840K+',  label: 'QUERIES ANSWERED' },
  { val: '12',     label: 'CHAINS SUPPORTED' },
  { val: '99.9%',  label: 'UPTIME SLA' },
]

export function StatsBand() {
  const ref = useScrollReveal()

  return (
    <div
      ref={ref}
      className="reveal-section"
      style={{
        padding:      '80px 60px',
        background:   'linear-gradient(135deg, rgba(124,109,250,0.07) 0%, rgba(56,189,248,0.04) 50%, rgba(124,109,250,0.05) 100%)',
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position:     'relative',
        zIndex:       1,
        overflow:     'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position:       'absolute',
          top:            '50%',
          left:           '50%',
          transform:      'translate(-50%,-50%)',
          width:          600,
          height:         300,
          background:     'radial-gradient(ellipse, rgba(124,109,250,0.1) 0%, transparent 70%)',
          pointerEvents:  'none',
        }}
      />
      <div
        className="stats-band-grid"
        style={{
          maxWidth:            1000,
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap:                 40,
          textAlign:           'center',
          position:            'relative',
        }}
      >
        {STATS.map(s => (
          <div key={s.label}>
            <div
              style={{
                fontFamily:              'var(--font-display)',
                fontSize:                'clamp(36px, 4vw, 52px)',
                fontWeight:              800,
                background:              'linear-gradient(135deg, var(--accent), var(--accent3))',
                WebkitBackgroundClip:    'text',
                WebkitTextFillColor:     'transparent',
                backgroundClip:          'text',
                lineHeight:              1,
                marginBottom:            10,
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize:      11,
                color:         'var(--muted)',
                letterSpacing: 2,
                fontFamily:    'var(--font-mono)',
                textTransform: 'uppercase',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   RISK SECTION
───────────────────────────────────────── */
const BARS = [
  { label: 'ETH',  pct: 64.6, color: 'linear-gradient(90deg,#627EEA,#7C6DFA)' },
  { label: 'SOL',  pct: 20.0, color: 'linear-gradient(90deg,#9945FF,#C97BFF)' },
  { label: 'USDC', pct: 11.2, color: 'linear-gradient(90deg,#2775CA,#38BDF8)' },
  { label: 'ARB',  pct: 4.2,  color: 'linear-gradient(90deg,#12AAFF,#38BDF8)' },
]

const TIERS = [
  {
    label:  'LOW RISK',
    desc:   'Diversified portfolio, healthy stablecoin buffer.',
    color:  'var(--green)',
    bg:     'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.2)',
  },
  {
    label:  'MED RISK',
    desc:   'Top holding exceeds 60% of portfolio.',
    color:  'var(--gold)',
    bg:     'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    label:  'HIGH RISK',
    desc:   'Single asset over 80%. Extreme concentration.',
    color:  'var(--red)',
    bg:     'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.2)',
  },
]

export function RiskSection() {
  const leftRef  = useScrollReveal()
  const rightRef = useScrollReveal()
  const barsRef  = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    if (!barsRef.current) return
    const el = barsRef.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const fills = el.querySelectorAll<HTMLDivElement>('[data-fill]')
          fills.forEach(fill => {
            const target = fill.getAttribute('data-fill') ?? '0'
            fill.style.width = target + '%'
          })
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="landing-section"
      style={{
        background:   'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        position:     'relative',
        zIndex:       1,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }} className="landing-grid-2">
        {/* Left: Risk card */}
        <div ref={leftRef} className="reveal-section">
          <RiskCard barsRef={barsRef} />
        </div>

        {/* Right: explanation */}
        <div ref={rightRef} className="reveal-section">
          <div className="section-tag">// RISK ENGINE</div>
          <h2 style={h2Style}>
            Know your risk<br />before the<br />market does.
          </h2>
          <p
            style={{
              fontSize:     14,
              color:        'var(--muted)',
              lineHeight:   1.85,
              maxWidth:     440,
              marginBottom: 36,
            }}
          >
            ØRACLE continuously analyzes your concentration, stablecoin buffer,
            and volatility exposure. Get a plain-English risk score — not just raw numbers.
          </p>

          <div
            className="risk-tiers"
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
          >
            {TIERS.map(t => (
              <div
                key={t.label}
                style={{
                  padding:    '18px 20px',
                  background: t.bg,
                  border:     `1px solid ${t.border}`,
                  borderRadius: 8,
                  flex:       1,
                  minWidth:   130,
                }}
              >
                <div
                  style={{
                    fontSize:      9,
                    color:         t.color,
                    letterSpacing: 2,
                    marginBottom:  8,
                    fontFamily:    'var(--font-mono)',
                    textTransform: 'uppercase',
                    fontWeight:    600,
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{
                    fontSize:   12,
                    color:      'var(--muted)',
                    lineHeight: 1.65,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RiskCard({ barsRef }: { barsRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      style={{
        background:  'var(--bg)',
        border:      '1px solid var(--border)',
        borderRadius: 16,
        padding:     32,
        boxShadow:   '0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,109,250,0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   28,
        }}
      >
        <div
          style={{
            fontFamily:   'var(--font-display)',
            fontSize:     16,
            fontWeight:   700,
            color:        'var(--text)',
            letterSpacing: -0.3,
          }}
        >
          Portfolio Risk Analysis
        </div>
        <span
          style={{
            padding:      '4px 12px',
            borderRadius: 4,
            fontSize:     10,
            letterSpacing: 1.5,
            background:   'rgba(245,158,11,0.09)',
            color:        'var(--gold)',
            border:       '1px solid rgba(245,158,11,0.28)',
            fontFamily:   'var(--font-mono)',
            textTransform: 'uppercase',
          }}
        >
          MEDIUM RISK
        </span>
      </div>

      {/* Allocation bars */}
      <div ref={barsRef}>
        {BARS.map(b => (
          <div key={b.label} style={{ marginBottom: 18 }}>
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                fontSize:       11,
                color:          'var(--muted)',
                marginBottom:   7,
                letterSpacing:  1,
                fontFamily:     'var(--font-mono)',
              }}
            >
              <span>{b.label}</span>
              <span>{b.pct}%</span>
            </div>
            <div
              style={{
                height:       7,
                borderRadius: 4,
                background:   'rgba(255,255,255,0.05)',
                overflow:     'hidden',
              }}
            >
              <div
                data-fill={b.pct}
                style={{
                  width:      '0%',
                  height:     '100%',
                  background: b.color,
                  borderRadius: 4,
                  transition: 'width 1s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Warning box */}
      <div
        style={{
          marginTop:   22,
          padding:     '14px 16px',
          background:  'rgba(245,158,11,0.05)',
          border:      '1px solid rgba(245,158,11,0.15)',
          borderRadius: 8,
          fontSize:    12,
          color:       '#D4B483',
          lineHeight:  1.75,
          fontFamily:  'var(--font-mono)',
        }}
      >
        ⚠ ETH is 64.6% of your portfolio. A 10% ETH decline would cost
        you $3,120. Consider rebalancing into stablecoins for downside protection.
      </div>
    </div>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontSize:      'clamp(28px, 3.2vw, 48px)',
  fontWeight:    800,
  lineHeight:    1.08,
  letterSpacing: -1,
  marginBottom:  24,
  color:         'var(--text)',
}

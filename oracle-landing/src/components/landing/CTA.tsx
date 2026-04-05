import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function CTA() {
  const ref = useScrollReveal()

  return (
    <section
      id="cta"
      className="landing-cta-padding"
      style={{
        textAlign:  'center',
        position:   'relative',
        zIndex:     1,
        overflow:   'hidden',
      }}
    >
      {/* Radial glow — indigo focal point */}
      <div
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%,-50%)',
          width:         900,
          height:        500,
          background:    'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%,-50%)',
          width:         500,
          height:        250,
          background:    'radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div ref={ref} className="reveal-section" style={{ position: 'relative' }}>
        <div className="section-tag">// Get Started</div>

        <h2
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(32px, 5vw, 72px)',
            fontWeight:    800,
            lineHeight:    1.02,
            letterSpacing: '-2.5px',
            maxWidth:      760,
            margin:        '0 auto 24px',
            color:         'var(--text)',
          }}
        >
          Your wallet has been<br />
          <span
            style={{
              background:           'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}
          >
            talking this whole time.
          </span>
        </h2>

        <p
          style={{
            fontSize:   15,
            color:      'var(--muted)',
            maxWidth:   440,
            margin:     '0 auto 52px',
            lineHeight: 1.8,
            fontFamily: 'var(--font-body)',
          }}
        >
          Connect in one click. No signup. No email. Just your wallet
          and the intelligence layer it deserves.
        </p>

        <a href="https://app.oracleprotocol.online" style={primaryBtn}>
          Connect Wallet — It's Free →
        </a>

        <p
          style={{
            marginTop:     32,
            fontSize:      11,
            color:         'var(--subtle)',
            letterSpacing: 1.5,
            fontFamily:    'var(--font-mono)',
          }}
        >
          Non-custodial · Read-only by default · No private keys
        </p>
      </div>
    </section>
  )
}

const primaryBtn: React.CSSProperties = {
  padding:        '15px 48px',
  background:     '#6366F1',
  border:         'none',
  color:          '#fff',
  fontFamily:     'var(--font-display)',
  fontSize:       15,
  fontWeight:     600,
  letterSpacing:  '-0.01em',
  borderRadius:   8,
  boxShadow:      '0 0 48px rgba(99,102,241,0.4)',
  transition:     'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  cursor:         'none',
  textDecoration: 'none',
  display:        'inline-block',
}

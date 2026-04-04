import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function CTA() {
  const ref = useScrollReveal()

  return (
    <section
      id="pricing"
      className="landing-cta-padding"
      style={{
        textAlign:  'center',
        position:   'relative',
        zIndex:     1,
        overflow:   'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position:       'absolute',
          top:            '50%',
          left:           '50%',
          transform:      'translate(-50%,-50%)',
          width:          800,
          height:         480,
          background:     'radial-gradient(ellipse, rgba(124,109,250,0.13) 0%, transparent 65%)',
          pointerEvents:  'none',
        }}
      />
      {/* Secondary accent glow */}
      <div
        style={{
          position:       'absolute',
          top:            '50%',
          left:           '50%',
          transform:      'translate(-50%,-50%)',
          width:          400,
          height:         200,
          background:     'radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)',
          pointerEvents:  'none',
        }}
      />

      <div ref={ref} className="reveal-section" style={{ position: 'relative' }}>
        <div className="section-tag">// GET STARTED</div>

        <h2
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(28px, 5vw, 68px)',
            fontWeight:    800,
            lineHeight:    1.04,
            letterSpacing: -2,
            maxWidth:      740,
            margin:        '0 auto 24px',
            color:         'var(--text)',
          }}
        >
          Your wallet has been<br />
          <span
            style={{
              background:              'linear-gradient(90deg, var(--accent), var(--accent3))',
              WebkitBackgroundClip:    'text',
              WebkitTextFillColor:     'transparent',
              backgroundClip:          'text',
            }}
          >
            talking this whole time.
          </span>
        </h2>

        <p
          style={{
            fontSize:     15,
            color:        'var(--muted)',
            maxWidth:     460,
            margin:       '0 auto 52px',
            lineHeight:   1.85,
            fontFamily:   'var(--font-mono)',
          }}
        >
          Connect in one click. No signup. No email. Just your wallet
          and the intelligence layer it deserves.
        </p>

        <div
          style={{
            display:        'flex',
            justifyContent: 'center',
            gap:            14,
            flexWrap:       'wrap',
          }}
        >
          <a href="https://app.oracleprotocol.online" style={primaryBtn}>
            Connect Wallet — It's Free →
          </a>
          <a href="https://docs.oracleprotocol.online" style={ghostBtn}>
            Read the Docs
          </a>
        </div>

        <p
          style={{
            marginTop:     32,
            fontSize:      11,
            color:         'var(--muted)',
            letterSpacing: 1.5,
            fontFamily:    'var(--font-mono)',
          }}
        >
          Non-custodial · Read-only by default · Open source
        </p>
      </div>
    </section>
  )
}

const primaryBtn: React.CSSProperties = {
  padding:         '16px 44px',
  background:      'linear-gradient(135deg, var(--accent), #9B8BFF)',
  border:          'none',
  color:           '#fff',
  fontFamily:      'var(--font-display)',
  fontSize:        15,
  fontWeight:      700,
  letterSpacing:   0.5,
  borderRadius:    5,
  boxShadow:       '0 0 40px rgba(124,109,250,0.4)',
  transition:      'transform 0.2s ease, box-shadow 0.2s ease',
  cursor:          'none',
  textDecoration:  'none',
  display:         'inline-block',
}

const ghostBtn: React.CSSProperties = {
  padding:         '15px 36px',
  border:          '1px solid var(--border)',
  background:      'transparent',
  color:           'var(--text)',
  fontFamily:      'var(--font-mono)',
  fontSize:        14,
  letterSpacing:   0.5,
  borderRadius:    5,
  cursor:          'none',
  textDecoration:  'none',
  display:         'inline-block',
  transition:      'border-color 0.2s, color 0.2s',
}

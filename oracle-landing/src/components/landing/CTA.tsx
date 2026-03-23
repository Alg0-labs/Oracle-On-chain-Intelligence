import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function CTA() {
  const ref = useScrollReveal()

  return (
    <section className="landing-cta-padding" style={{ textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 400,
        background: 'radial-gradient(ellipse, rgba(124,109,250,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div ref={ref} className="reveal-section">
        <div className="section-tag">// GET STARTED</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 68px)',
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: -2,
          maxWidth: 700, margin: '0 auto 24px',
        }}>
          Your wallet has been<br />
          <span style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>talking this whole time.</span>
        </h2>

        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.85 }}>
          Connect in one click. No signup. No email. Just your wallet
          and the intelligence layer it deserves.
        </p>

        {/* <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="#" style={primaryBtn}>Connect Wallet — It's Free →</a>
          <a href="#" style={ghostBtn}>Read the Docs</a>
        </div> */}

        <p style={{ marginTop: 28, fontSize: 11, color: 'var(--muted)', letterSpacing: 1 }}>
          Non-custodial · Read-only by default · Open source
        </p>
      </div>
    </section>
  )
}

const primaryBtn: React.CSSProperties = {
  padding: '16px 44px',
  background: 'linear-gradient(135deg, var(--accent), #9B8BFF)',
  border: 'none', color: '#fff',
  fontFamily: 'var(--font-display)',
  fontSize: 15, fontWeight: 700, letterSpacing: 1,
  borderRadius: 4,
  boxShadow: '0 0 40px rgba(124,109,250,0.4)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'none',
}
const ghostBtn: React.CSSProperties = {
  padding: '15px 36px',
  border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 14, letterSpacing: 1,
  borderRadius: 4, cursor: 'none',
}

import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function SendEth() {
  const leftRef  = useScrollReveal()
  const rightRef = useScrollReveal()

  const checks = [
    'Natural language intent detection',
    'Full transaction preview before signing',
    'Signed by your wallet — keys never leave',
    'Etherscan link on confirmation',
  ]

  return (
    <section id="send-eth" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 100, alignItems: 'center',
        padding: '120px 60px',
      }}>
        {/* Left */}
        <div ref={leftRef} className="reveal-section">
          <div className="section-tag">// SEND ETH</div>
          <h2 style={h2Style}>Send crypto.<br />Just by asking.</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, maxWidth: 440, marginBottom: 36 }}>
            Type "send 0.5 ETH to 0x742d..." in the chat.
            ØRACLE detects the intent, shows you a full breakdown,
            and executes via your connected wallet. You confirm. Done.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {checks.map(c => (
              <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--muted)' }}>
                <span style={{ color: 'var(--green)', fontSize: 17, lineHeight: 1 }}>✓</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: TX modal illustration */}
        <div ref={rightRef} className="reveal-section">
          <TxModal />
        </div>
      </div>
    </section>
  )
}

function TxModal() {
  const rows = [
    { label: 'ACTION',    value: 'Send ETH',         color: 'var(--accent2)' },
    { label: 'TO ADDRESS', value: '0x742d...F44e',   color: 'var(--text)' },
    { label: 'AMOUNT',    value: '0.5 ETH',           color: 'var(--text)' },
    { label: 'USD VALUE', value: '≈ $1,258.00',       color: 'var(--text)' },
    { label: 'NETWORK',   value: 'Ethereum Mainnet',  color: 'var(--text)' },
    { label: 'GAS EST.',  value: '~$2.40',            color: 'var(--green)' },
  ]

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: 32,
      boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 24 }}>CONFIRM TRANSACTION</div>

      {rows.map(r => (
        <div key={r.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '13px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1 }}>{r.label}</span>
          <span style={{ fontSize: 13, color: r.color, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
        </div>
      ))}

      <p style={{ fontSize: 11, color: 'rgba(245,158,11,0.8)', margin: '18px 0 20px', lineHeight: 1.65 }}>
        ⚠ This will broadcast a real transaction on Ethereum mainnet.
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={cancelBtn}>Cancel</button>
        <button style={confirmBtn}>Confirm &amp; Send →</button>
      </div>
    </div>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(32px, 3.5vw, 50px)',
  fontWeight: 800, lineHeight: 1.1,
  letterSpacing: -1, marginBottom: 24,
}
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: 13,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6, color: 'var(--muted)',
  fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'none',
}
const confirmBtn: React.CSSProperties = {
  flex: 2, padding: 13,
  background: 'linear-gradient(135deg, var(--accent), #9B8BFF)',
  border: 'none', borderRadius: 6, color: '#fff',
  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'none',
}

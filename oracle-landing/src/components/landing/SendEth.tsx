import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const CHECKS = [
  'Natural language intent detection',
  'Full transaction preview before signing',
  'Signed by your wallet — keys never leave',
  'Etherscan link on confirmation',
]

const TX_ROWS = [
  { label: 'ACTION',     value: 'Send ETH',          color: 'var(--accent2)' },
  { label: 'TO ADDRESS', value: '0x742d...F44e',      color: 'var(--text)' },
  { label: 'AMOUNT',     value: '0.5 ETH',            color: 'var(--text)' },
  { label: 'USD VALUE',  value: '≈ $1,258.00',        color: 'var(--text)' },
  { label: 'NETWORK',    value: 'Ethereum Mainnet',   color: 'var(--text)' },
  { label: 'GAS EST.',   value: '~$2.40',             color: 'var(--green)' },
]

export function SendEth() {
  const leftRef  = useScrollReveal()
  const rightRef = useScrollReveal()

  return (
    <section
      id="send-eth"
      className="landing-section"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }} className="landing-grid-2">
        {/* Left */}
        <div ref={leftRef} className="reveal-section">
          <div className="section-tag">// SEND ETH</div>
          <h2 style={h2Style}>
            Send crypto.<br />Just by asking.
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
            Type "send 0.5 ETH to 0x742d..." in the chat. ØRACLE detects
            the intent, shows you a full breakdown, and executes via your
            connected wallet. You confirm. Done.
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CHECKS.map(c => (
              <li
                key={c}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        12,
                  fontSize:   13,
                  color:      'var(--muted)',
                }}
              >
                <span
                  style={{
                    width:        20,
                    height:       20,
                    borderRadius: '50%',
                    background:   'rgba(52,211,153,0.1)',
                    border:       '1px solid rgba(52,211,153,0.3)',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    color:        'var(--green)',
                    fontSize:     12,
                    flexShrink:   0,
                  }}
                >
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: TX modal */}
        <div ref={rightRef} className="reveal-section">
          <TxModal />
        </div>
      </div>
    </section>
  )
}

function TxModal() {
  return (
    <div
      className="tx-modal"
      style={{
        background:  'var(--bg2)',
        border:      '1px solid var(--border)',
        borderRadius: 16,
        padding:     32,
        boxShadow:   '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,109,250,0.06)',
        position:    'relative',
        overflow:    'hidden',
      }}
    >
      {/* Subtle purple glow top */}
      <div
        style={{
          position:       'absolute',
          top:            -60,
          left:           '50%',
          transform:      'translateX(-50%)',
          width:          280,
          height:         120,
          background:     'radial-gradient(ellipse, rgba(124,109,250,0.14) 0%, transparent 70%)',
          pointerEvents:  'none',
        }}
      />

      <div
        style={{
          fontSize:      10,
          color:         'var(--muted)',
          letterSpacing: 2,
          marginBottom:  24,
          fontFamily:    'var(--font-mono)',
          textTransform: 'uppercase',
        }}
      >
        CONFIRM TRANSACTION
      </div>

      {TX_ROWS.map(r => (
        <div
          key={r.label}
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            padding:        '13px 0',
            borderBottom:   '1px solid var(--border)',
          }}
        >
          <span
            style={{
              fontSize:      11,
              color:         'var(--muted)',
              letterSpacing: 1,
              fontFamily:    'var(--font-mono)',
            }}
          >
            {r.label}
          </span>
          <span
            style={{
              fontSize:   13,
              color:      r.color,
              fontFamily: 'var(--font-mono)',
              fontWeight: r.label === 'GAS EST.' ? 600 : 400,
            }}
          >
            {r.value}
          </span>
        </div>
      ))}

      <div
        style={{
          margin:      '18px 0 20px',
          padding:     '12px 14px',
          background:  'rgba(245,158,11,0.05)',
          border:      '1px solid rgba(245,158,11,0.18)',
          borderRadius: 6,
          fontSize:    11,
          color:       'rgba(245,158,11,0.85)',
          lineHeight:  1.65,
          fontFamily:  'var(--font-mono)',
        }}
      >
        ⚠ This will broadcast a real transaction on Ethereum mainnet. Verify address before confirming.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={cancelBtn}>Cancel</button>
        <button style={confirmBtn}>Confirm &amp; Send →</button>
      </div>
    </div>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontSize:      'clamp(30px, 3.5vw, 50px)',
  fontWeight:    800,
  lineHeight:    1.1,
  letterSpacing: -1,
  marginBottom:  24,
  color:         'var(--text)',
}

const cancelBtn: React.CSSProperties = {
  flex:        1,
  padding:     13,
  background:  'var(--bubble-ai-bg)',
  border:      '1px solid var(--bubble-ai-border)',
  borderRadius: 6,
  color:       'var(--muted)',
  fontFamily:  'var(--font-mono)',
  fontSize:    12,
  cursor:      'none',
  transition:  'background 0.2s',
}

const confirmBtn: React.CSSProperties = {
  flex:        2,
  padding:     13,
  background:  'linear-gradient(135deg, var(--accent), #9B8BFF)',
  border:      'none',
  borderRadius: 6,
  color:       '#fff',
  fontFamily:  'var(--font-display)',
  fontSize:    13,
  fontWeight:  700,
  cursor:      'none',
  letterSpacing: 0.3,
}

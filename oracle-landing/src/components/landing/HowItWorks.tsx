import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const STEPS = [
  {
    num: '01', title: 'Connect your wallet',
    desc: 'One click via WalletConnect or MetaMask. Supports Ethereum, Arbitrum, Polygon and more. No private keys, ever.',
  },
  {
    num: '02', title: 'ØRACLE indexes your data',
    desc: 'We pull live balances, token holdings, transaction history, and NFTs from Moralis and the blockchain in real time.',
  },
  {
    num: '03', title: 'Ask anything',
    desc: 'Your wallet becomes the context. Claude AI reads your actual data and answers with precision — no hallucinations.',
  },
  {
    num: '04', title: 'Act on insights',
    desc: 'Send ETH directly from chat. Confirm in one click. Transaction executes via your wallet — you stay in control.',
  },
]

export function HowItWorks() {
  const leftRef  = useScrollReveal()
  const rightRef = useScrollReveal()

  return (
    <section id="how-it-works" className="landing-section" style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }} className="landing-grid-2">
        {/* Left: Steps */}
        <div ref={leftRef} className="reveal-section">
          <div className="section-tag">// HOW IT WORKS</div>
          <h2 style={h2Style}>From wallet<br />to wisdom<br />in seconds.</h2>
          <div>
            {STEPS.map((s, i) => (
              <Step key={i} {...s} />
            ))}
          </div>
        </div>

        {/* Right: Chat demo */}
        <div ref={rightRef} className="reveal-section">
          <ChatDemo />
        </div>
      </div>
    </section>
  )
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex', gap: 24,
      padding: '30px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 11, fontWeight: 800,
        color: 'var(--accent)', letterSpacing: 2,
        minWidth: 32, paddingTop: 3,
      }}>{num}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>{desc}</div>
      </div>
    </div>
  )
}

function ChatDemo() {
  const messages = [
    { role: 'user',      text: 'What is my current net worth?' },
    { role: 'assistant', text: 'Your total portfolio is $48,320.\n\nETH:  12.4 Ξ = $31,200 (64.6%)\nSOL:  88 tokens = $9,680 (20.0%)\nUSDC: $5,420 (11.2%)\nARB:  $2,020 (4.2%)\n\nYou\'re down $2,891 (-5.6%) over 24h.' },
    { role: 'user',      text: 'Am I overexposed to anything?' },
    { role: 'assistant', text: 'Yes. ETH is 64.6% of your portfolio — significant concentration risk. A 10% ETH drop costs you $3,120.\n\nStablecoins at 11.2% — low buffer for your size.\n\nRisk level: MEDIUM' },
  ]

  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,109,250,0.08)',
    }}>
      {/* Topbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        background: 'rgba(124,109,250,0.05)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: 4, color: 'var(--accent)' }}>ØRACLE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', display: 'inline-block' }} />
          0x3f4A...8c2E · $48,320
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 2, marginBottom: 6 }}>ØRACLE</div>
            )}
            <div style={{
              padding: '11px 15px',
              fontSize: 12, lineHeight: 1.75,
              borderRadius: m.role === 'user' ? '8px 2px 8px 8px' : '2px 8px 8px 8px',
              background: m.role === 'user' ? 'rgba(124,109,250,0.14)' : 'var(--bubble-ai-bg)',
              border: m.role === 'user' ? '1px solid rgba(124,109,250,0.25)' : '1px solid var(--bubble-ai-border)',
              color: m.role === 'user' ? 'var(--text)' : 'var(--bubble-ai-text)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex', gap: 10, padding: '14px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bubble-input-bar)',
      }}>
        <div style={{
          flex: 1,
          background: 'var(--bubble-input-bg)',
          border: '1px solid var(--bubble-input-border)',
          borderRadius: 6, padding: '9px 14px',
          fontSize: 12, color: 'var(--muted)',
        }}>Ask about your wallet...</div>
        <button style={{
          width: 38, height: 38,
          background: 'linear-gradient(135deg, var(--accent), #9B8BFF)',
          border: 'none', borderRadius: 6,
          color: 'white', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'none',
        }}>↑</button>
      </div>
    </div>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(32px, 3.5vw, 50px)',
  fontWeight: 800, lineHeight: 1.1,
  letterSpacing: -1, marginBottom: 40,
}

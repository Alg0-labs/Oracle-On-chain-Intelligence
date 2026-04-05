import React from 'react'

const TESTIMONIALS = [
  { quote: "ØRACLE showed me I had 78% in ETH. I had zero idea I was that concentrated.", author: "cryptodev.eth", handle: "@cryptodev.eth" },
  { quote: "Sent ETH just by typing in chat. I thought it was a demo — it actually executed.", author: "defi_whale", handle: "@defi_whale" },
  { quote: "The risk analysis caught a bad allocation before a 30% correction. Saved me.", author: "nftcollector", handle: "@nftcollector" },
  { quote: "Best on-chain intelligence tool I've used. Nothing else comes close.", author: "web3builder", handle: "@web3builder" },
  { quote: "Finally understand my own wallet after 3 years in crypto. ØRACLE is it.", author: "hodler_2021", handle: "@hodler_2021" },
  { quote: "AI that reads your actual data, not hallucinated numbers. Rare and valuable.", author: "0xTrader", handle: "@0xTrader" },
]

export function Testimonials() {
  // Duplicate for seamless loop
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section style={{ padding: '120px 0', background: 'var(--bg)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', padding: '0 60px', marginBottom: 64 }}>
        <div className="section-tag">// TRUSTED BY</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.1, marginBottom: 16 }}>
          Traders who finally<br />understand their wallets.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--muted)', fontFamily: 'var(--font-body)', maxWidth: 460, margin: '0 auto', lineHeight: 1.8 }}>
          Real feedback from real wallets.
        </p>
      </div>

      {/* Carousel wrap */}
      <div
        style={{ overflow: 'hidden', position: 'relative' }}
        onMouseEnter={e => {
          const track = e.currentTarget.querySelector('.testimonial-track') as HTMLElement | null
          if (track) track.style.animationPlayState = 'paused'
        }}
        onMouseLeave={e => {
          const track = e.currentTarget.querySelector('.testimonial-track') as HTMLElement | null
          if (track) track.style.animationPlayState = 'running'
        }}
      >
        {/* Fade masks */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 160, background: 'linear-gradient(90deg, var(--bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 160, background: 'linear-gradient(-90deg, var(--bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div
          className="testimonial-track"
          style={{ display: 'flex', gap: 20, width: 'max-content', animation: 'testimonial-scroll 40s linear infinite', padding: '8px 20px' }}
        >
          {doubled.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, author, handle }: { quote: string; author: string; handle: string }) {
  const initials = author.slice(0, 2).toUpperCase()

  return (
    <div
      style={{
        minWidth:   320,
        maxWidth:   320,
        background: 'var(--bg2)',
        border:     '1px solid rgba(124,109,250,0.18)',
        borderRadius: 12,
        padding:    28,
        cursor:     'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(124,109,250,0.4)'
        el.style.boxShadow   = '0 0 20px rgba(124,109,250,0.12)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(124,109,250,0.18)'
        el.style.boxShadow   = 'none'
      }}
    >
      {/* Quote mark */}
      <div style={{ fontSize: 32, color: 'rgba(124,109,250,0.3)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 12 }}>"</div>
      <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-body)', lineHeight: 1.75, marginBottom: 24 }}>
        {quote}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,109,250,0.2)', border: '1px solid rgba(124,109,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#A78BFA', fontFamily: 'IBM Plex Sans, sans-serif', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{author}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-label)' }}>{handle}</div>
        </div>
      </div>
    </div>
  )
}

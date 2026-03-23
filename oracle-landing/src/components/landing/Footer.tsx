import React from 'react'
const COLS = [
  {
    title: 'PRODUCT',
    links: ['Features', 'How it works', 'Roadmap', 'Changelog'],
  },
  {
    title: 'DEVELOPERS',
    links: ['Documentation', 'API Reference', 'GitHub', 'Status'],
  },
  {
    title: 'COMPANY',
    links: ['About', 'Blog', 'Privacy', 'Terms'],
  },
]

const SOCIALS = [
  { icon: '𝕏',  label: 'Twitter/X' },
  { icon: '⌥',  label: 'GitHub' },
  { icon: '◈',  label: 'Discord' },
  { icon: '✈',  label: 'Telegram' },
]

export function Footer() {
  return (
    <footer className="landing-footer" style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      padding: '60px 60px 40px',
      position: 'relative', zIndex: 1,
    }}>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: 60, marginBottom: 60,
      }}>
        {/* Brand */}
        <div>
          <a href="#" style={{ display: 'flex', alignItems: 'baseline', gap: 3, textDecoration: 'none', marginBottom: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', fontFamily: 'serif' }}>⌀</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: 6, color: 'var(--text)' }}>RACLE</span>
          </a>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, maxWidth: 280 }}>
            On-chain intelligence, distilled. The AI layer your crypto wallet has always needed.
          </p>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
            <MiniStat val="ETH" label="Mainnet" />
            <MiniStat val="ARB" label="Arbitrum" />
            <MiniStat val="POL" label="Polygon" />
          </div>
        </div>

        {/* Link columns */}
        {/* {COLS.map(col => (
          <div key={col.title}>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12, fontWeight: 700,
              letterSpacing: 2, color: 'var(--text)',
              marginBottom: 20,
            }}>{col.title}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {col.links.map(l => (
                <li key={l}>
                  <a href="#"
                    style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent2)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                  >{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))} */}
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 32,
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          © 2026 ØRACLE. All rights reserved. Non-custodial. Built on Ethereum.
        </div>
        {/* <div style={{ display: 'flex', gap: 12 }}>
          {SOCIALS.map(s => (
            <a key={s.label} href="#" title={s.label}
              style={{
                width: 36, height: 36,
                border: '1px solid var(--border)',
                borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)', textDecoration: 'none',
                fontSize: 14, transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'var(--accent)'
                el.style.color = 'var(--accent)'
                el.style.background = 'rgba(124,109,250,0.1)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'var(--border)'
                el.style.color = 'var(--muted)'
                el.style.background = 'transparent'
              }}
            >{s.icon}</a>
          ))}
        </div> */}
      </div>
    </footer>
  )
}

function MiniStat({ val, label }: { val: string; label: string }) {
  return (
    <div style={{
      padding: '6px 12px',
      background: 'rgba(124,109,250,0.07)',
      border: '1px solid var(--border)',
      borderRadius: 4, textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
      <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>{label}</div>
    </div>
  )
}

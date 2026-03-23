import React from 'react'
import { useEffect, useState } from 'react'

const links = ['Features', 'How it works', 'Send ETH']

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 60px', height: 72,
      background: scrolled ? 'rgba(6,8,16,0.98)' : 'rgba(6,8,16,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: scrolled ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Logo */}
      <a href="#" style={{ display: 'flex', alignItems: 'baseline', gap: 3, textDecoration: 'none' }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--accent)', fontFamily: 'serif', lineHeight: 1 }}>⌀</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: 6, color: 'var(--text)' }}>RACLE</span>
      </a>

      {/* Desktop links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: 36, listStyle: 'none' }}
        className="nav-links-desktop">
        {links.map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: 1, textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >{l}</a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a href="https://app.oracleprotocol.online" style={primaryBtn}>Launch App →</a>
      </div>
    </nav>
  )
}

const ghostBtn: React.CSSProperties = {
  padding: '9px 22px',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12, letterSpacing: 1,
  borderRadius: 4,
  cursor: 'none',
  transition: 'all 0.2s',
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 24px',
  background: 'linear-gradient(135deg, var(--accent), #9B8BFF)',
  border: 'none', color: '#fff',
  fontFamily: 'var(--font-display)',
  fontSize: 13, fontWeight: 700, letterSpacing: 1,
  borderRadius: 4,
  boxShadow: '0 0 24px rgba(124,109,250,0.35)',
  transition: 'all 0.2s',
  cursor: 'none',
}

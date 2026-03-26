import React from 'react'
import { useEffect, useState } from 'react'
import styles from './Navbar.module.css'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Send ETH', href: '#send-eth' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav
        className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      >
        <a href="#" className={styles.logo} onClick={closeMenu}>
          <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--accent)', fontFamily: 'serif', lineHeight: 1 }}>⌀</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: 6, color: 'var(--text)' }}>RACLE</span>
        </a>

        <ul className={styles.desktopLinks}>
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className={styles.link}>{l.label}</a>
            </li>
          ))}
        </ul>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        <div className={styles.ctaWrap}>
          <a href="https://app.oracleprotocol.online" style={primaryBtn}>Launch App →</a>
        </div>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {links.map(l => (
            <a key={l.href} href={l.href} className={styles.mobileLink} onClick={closeMenu}>
              {l.label}
            </a>
          ))}
          <a
            href="https://app.oracleprotocol.online"
            className={styles.mobileCta}
            onClick={closeMenu}
          >
            Launch App →
          </a>
        </div>
      )}
    </>
  )
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
  textDecoration: 'none',
  display: 'inline-block',
}

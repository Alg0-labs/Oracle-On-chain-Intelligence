import { useEffect, useState } from 'react'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Send ETH',     href: '#send-eth' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Docs',         href: 'https://docs.oracleprotocol.online' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        {/* Logo */}
        <a href="#" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoGlyph}>⌀</span>
          <span className={styles.logoText}>RACLE</span>
        </a>

        {/* Desktop links */}
        <ul className={styles.desktopLinks}>
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href} className={styles.link}>{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Right CTA group */}
        <div className={styles.ctaGroup}>
          <a
            href="https://app.oracleprotocol.online"
            className={styles.signInBtn}
          >
            Sign in
          </a>
          <a
            href="https://app.oracleprotocol.online"
            className={styles.launchBtn}
          >
            Launch App →
          </a>
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={closeMenu}
            >
              {l.label}
            </a>
          ))}
          <div className={styles.mobileDivider} />
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

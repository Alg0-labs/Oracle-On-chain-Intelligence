import { useEffect, useState } from 'react'
import styles from './Navbar.module.css'
import { useTheme } from '../../lib/theme'

const NAV_LINKS = [
  { label: 'Features',     href: '#features'    },
  { label: 'How it works', href: '#how-it-works' },
]

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.4 3.6L11.3 4.7M4.7 11.3L3.6 12.4M12.4 12.4L11.3 11.3M4.7 4.7L3.6 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 9A5.5 5.5 0 0 1 7 2.5c0-.28.02-.56.06-.83A6.5 6.5 0 1 0 13.83 9.44 5.5 5.5 0 0 1 13.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const { theme, toggle } = useTheme()

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
          <span className={styles.logoGlyph}>Ø</span>
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
          <button
            className={styles.themeToggle}
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <a href="https://app.oracleprotocol.online" className={styles.launchBtn}>
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
            <a key={l.href} href={l.href} className={styles.mobileLink} onClick={closeMenu}>
              {l.label}
            </a>
          ))}
          <button
            className={styles.mobileThemeToggle}
            onClick={() => { toggle(); closeMenu() }}
          >
            {theme === 'dark' ? '☀  Switch to Light Mode' : '☽  Switch to Dark Mode'}
          </button>
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

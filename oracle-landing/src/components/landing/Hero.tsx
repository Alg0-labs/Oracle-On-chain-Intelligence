import React from 'react'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        {/* Live badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>NOW LIVE ON ETHEREUM MAINNET</span>
        </div>

        <h1 className={styles.h1}>
          Your wallet,<br />
          <span className={styles.gradient}>finally explained.</span>
        </h1>

        <p className={styles.sub}>
          ØRACLE is an AI intelligence layer for your crypto wallet.
          Connect once. Ask anything. Understand everything — in plain English.
        </p>

        <div className={styles.actions}>
          <a href="#how-it-works" className={styles.btnGhost}>
            <PlayIcon />
            See how it works
          </a>
        </div>

        {/* <div className={styles.stats}>
          <Stat value="" label="WALLETS ANALYZED" />
          <Stat value=""   label="CHAINS SUPPORTED" />
          <Stat value="" label="UPTIME" />
        </div> */}
      </div>

      <div className={styles.right}>
        <div className={styles.glow} />
        <WalletIllustration />
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" />
      <polygon points="6.5,5 11.5,8 6.5,11" fill="currentColor" />
    </svg>
  )
}

function WalletIllustration() {
  return (
    <svg
      width="520" height="480"
      viewBox="0 0 520 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
    >
      {/* Dashed orbit rings */}
      <circle cx="260" cy="240" r="200" stroke="rgba(124,109,250,0.07)" strokeWidth="1" strokeDasharray="4 8" />
      <circle cx="260" cy="240" r="155" stroke="rgba(124,109,250,0.1)"  strokeWidth="1" strokeDasharray="2 6" />

      {/* Spinning accent arc */}
      <circle
        cx="260" cy="240" r="200"
        stroke="url(#heroGrad)"
        strokeWidth="1.5"
        strokeDasharray="70 200"
        style={{ transformOrigin: '260px 240px', animation: 'spin-slow 12s linear infinite' }}
      />

      {/* Central wallet card */}
      <rect x="155" y="165" width="210" height="150" rx="14"
        fill="#0E1220" stroke="rgba(124,109,250,0.3)" strokeWidth="1" />
      <rect x="155" y="165" width="210" height="42" rx="14"
        fill="rgba(124,109,250,0.1)" />
      <rect x="155" y="193" width="210" height="14"
        fill="rgba(124,109,250,0.08)" />

      {/* Chip */}
      <rect x="174" y="175" width="30" height="22" rx="4"
        fill="rgba(124,109,250,0.35)" stroke="rgba(124,109,250,0.6)" strokeWidth="0.5" />
      <line x1="180" y1="175" x2="180" y2="197" stroke="rgba(124,109,250,0.3)" strokeWidth="0.5" />
      <line x1="186" y1="175" x2="186" y2="197" stroke="rgba(124,109,250,0.3)" strokeWidth="0.5" />
      <line x1="192" y1="175" x2="192" y2="197" stroke="rgba(124,109,250,0.3)" strokeWidth="0.5" />
      <line x1="174" y1="185" x2="204" y2="185" stroke="rgba(124,109,250,0.3)" strokeWidth="0.5" />

      {/* Card content */}
      <rect x="174" y="225" width="125" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
      <rect x="174" y="240" width="85"  height="5" rx="2.5" fill="rgba(255,255,255,0.08)" />
      <rect x="174" y="268" width="54"  height="5" rx="2.5" fill="rgba(255,255,255,0.08)" />
      <rect x="298" y="268" width="42"  height="5" rx="2.5" fill="rgba(52,211,153,0.5)" />
      <text x="322" y="200" fontSize="24" fill="rgba(124,109,250,0.7)" fontFamily="serif">Ξ</text>

      {/* Floating node: Net Worth */}
      <g transform="translate(55,105)">
        <rect width="96" height="56" rx="8" fill="#0C1018" stroke="rgba(124,109,250,0.25)" strokeWidth="1" />
        <text x="10" y="17" fontSize="8"  fill="rgba(124,109,250,0.7)" fontFamily="monospace" letterSpacing="1">NET WORTH</text>
        <text x="10" y="36" fontSize="16" fill="#E8E6FF" fontFamily="Syne, sans-serif" fontWeight="700">$48,320</text>
        <text x="10" y="50" fontSize="9"  fill="rgba(52,211,153,0.9)" fontFamily="monospace">▲ +2.4%</text>
      </g>

      {/* Floating node: Risk */}
      <g transform="translate(368,90)">
        <rect width="84" height="56" rx="8" fill="#0C1018" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
        <text x="10" y="17" fontSize="8"  fill="rgba(245,158,11,0.7)" fontFamily="monospace" letterSpacing="1">RISK</text>
        <text x="10" y="36" fontSize="15" fill="#F59E0B" fontFamily="Syne, sans-serif" fontWeight="700">MEDIUM</text>
        <rect x="10" y="42" width="44" height="4" rx="2" fill="rgba(245,158,11,0.15)" />
        <rect x="10" y="42" width="28" height="4" rx="2" fill="rgba(245,158,11,0.6)" />
      </g>

      {/* Floating node: ETH */}
      <g transform="translate(368,320)">
        <rect width="90" height="56" rx="8" fill="#0C1018" stroke="rgba(98,126,234,0.3)" strokeWidth="1" />
        <text x="10" y="17" fontSize="8"  fill="rgba(98,126,234,0.8)" fontFamily="monospace" letterSpacing="1">ETH BALANCE</text>
        <text x="10" y="36" fontSize="15" fill="#E8E6FF" fontFamily="Syne, sans-serif" fontWeight="700">12.4 Ξ</text>
        <text x="10" y="50" fontSize="9"  fill="rgba(248,113,113,0.8)" fontFamily="monospace">▼ -3.2%</text>
      </g>

      {/* Floating node: AI thinking */}
      <g transform="translate(50,318)">
        <rect width="98" height="48" rx="8" fill="rgba(124,109,250,0.1)" stroke="rgba(124,109,250,0.3)" strokeWidth="1" />
        <text x="10" y="16" fontSize="9"  fill="rgba(124,109,250,0.8)" fontFamily="monospace">ØRACLE</text>
        <text x="10" y="32" fontSize="10" fill="#C8C6E0" fontFamily="monospace">Analyzing...</text>
        <circle cx="12" cy="41" r="2.5" fill="rgba(124,109,250,0.8)" style={{ animation: 'blink 1.2s 0s infinite' }} />
        <circle cx="21" cy="41" r="2.5" fill="rgba(124,109,250,0.8)" style={{ animation: 'blink 1.2s 0.2s infinite' }} />
        <circle cx="30" cy="41" r="2.5" fill="rgba(124,109,250,0.8)" style={{ animation: 'blink 1.2s 0.4s infinite' }} />
      </g>

      {/* Connector dashes */}
      <line x1="155" y1="218" x2="151" y2="133" stroke="rgba(124,109,250,0.18)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="365" y1="208" x2="368" y2="118" stroke="rgba(245,158,11,0.18)"  strokeWidth="1" strokeDasharray="4 4" />
      <line x1="365" y1="272" x2="368" y2="348" stroke="rgba(98,126,234,0.18)"  strokeWidth="1" strokeDasharray="4 4" />
      <line x1="155" y1="272" x2="148" y2="342" stroke="rgba(124,109,250,0.18)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Pulse rings */}
      <circle cx="260" cy="240" r="22" stroke="rgba(124,109,250,0.4)" strokeWidth="1"
        style={{ transformOrigin: '260px 240px', animation: 'pulse-ring 2.2s ease-out infinite' }} />
      <circle cx="260" cy="240" r="22" stroke="rgba(124,109,250,0.2)" strokeWidth="1"
        style={{ transformOrigin: '260px 240px', animation: 'pulse-ring 2.2s 0.7s ease-out infinite' }} />

      {/* Ambient particles */}
      <circle cx="205" cy="138" r="2.5" fill="rgba(124,109,250,0.5)" style={{ animation: 'blink 3.2s 0.5s infinite' }} />
      <circle cx="315" cy="152" r="2"   fill="rgba(56,189,248,0.5)"  style={{ animation: 'blink 2.5s 1.1s infinite' }} />
      <circle cx="345" cy="298" r="2.5" fill="rgba(52,211,153,0.5)"  style={{ animation: 'blink 3.5s 0.2s infinite' }} />
      <circle cx="168" cy="308" r="2"   fill="rgba(245,158,11,0.5)"  style={{ animation: 'blink 2.1s 0.8s infinite' }} />
      <circle cx="258" cy="118" r="2.5" fill="rgba(124,109,250,0.4)" style={{ animation: 'blink 4s 0.3s infinite' }} />

      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(124,109,250,0)" />
          <stop offset="50%"  stopColor="rgba(124,109,250,0.9)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

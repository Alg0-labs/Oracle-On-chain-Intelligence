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
          <a href="https://app.oracleprotocol.online" className={styles.btnPrimary}>
            Connect Wallet →
          </a>
          <a href="#how-it-works" className={styles.btnGhost}>
            <PlayIcon />
            See how it works
          </a>
        </div>

        {/* Stats row */}
        <div className={styles.stats}>
          <Stat value="$2.4B+" label="WALLETS ANALYZED" />
          <Stat value="12+"    label="CHAINS SUPPORTED" />
          <Stat value="99.9%"  label="UPTIME" />
        </div>
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
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
      aria-hidden="true"
    >
      {/* Outer dashed orbit ring */}
      <circle
        cx="260" cy="240" r="200"
        stroke="rgba(124,109,250,0.06)"
        strokeWidth="1"
        strokeDasharray="4 8"
        style={{ transformOrigin: '260px 240px', animation: 'spin-slow 24s linear infinite' }}
      />
      {/* Inner dashed orbit ring */}
      <circle
        cx="260" cy="240" r="155"
        stroke="rgba(124,109,250,0.09)"
        strokeWidth="1"
        strokeDasharray="2 6"
        style={{ transformOrigin: '260px 240px', animation: 'spin-slow 18s linear infinite reverse' }}
      />

      {/* Spinning accent arc */}
      <circle
        cx="260" cy="240" r="200"
        stroke="url(#heroGrad)"
        strokeWidth="1.5"
        strokeDasharray="70 200"
        style={{ transformOrigin: '260px 240px', animation: 'spin-slow 12s linear infinite' }}
      />

      {/* Central wallet card body */}
      <rect x="150" y="162" width="220" height="155" rx="14"
        fill="#0D1120" stroke="rgba(124,109,250,0.28)" strokeWidth="1" />
      {/* Card header band */}
      <rect x="150" y="162" width="220" height="44" rx="14"
        fill="rgba(124,109,250,0.09)" />
      <rect x="150" y="192" width="220" height="14"
        fill="rgba(124,109,250,0.06)" />

      {/* SIM chip */}
      <rect x="170" y="173" width="32" height="23" rx="4"
        fill="rgba(124,109,250,0.32)" stroke="rgba(124,109,250,0.55)" strokeWidth="0.5" />
      <line x1="176" y1="173" x2="176" y2="196" stroke="rgba(124,109,250,0.28)" strokeWidth="0.5" />
      <line x1="182" y1="173" x2="182" y2="196" stroke="rgba(124,109,250,0.28)" strokeWidth="0.5" />
      <line x1="188" y1="173" x2="188" y2="196" stroke="rgba(124,109,250,0.28)" strokeWidth="0.5" />
      <line x1="170" y1="183" x2="202" y2="183" stroke="rgba(124,109,250,0.28)" strokeWidth="0.5" />

      {/* ETH symbol */}
      <text x="318" y="197" fontSize="26" fill="rgba(124,109,250,0.65)" fontFamily="serif">Ξ</text>

      {/* Card data rows */}
      <rect x="170" y="222" width="130" height="6" rx="3" fill="rgba(255,255,255,0.14)" />
      <rect x="170" y="238" width="90"  height="5" rx="2" fill="rgba(255,255,255,0.07)" />
      <rect x="170" y="268" width="56"  height="5" rx="2" fill="rgba(255,255,255,0.07)" />
      <rect x="296" y="268" width="44"  height="5" rx="2" fill="rgba(52,211,153,0.48)" />

      {/* ── Floating data nodes ── */}

      {/* Net Worth node — top left */}
      <g transform="translate(46,96)">
        <rect width="104" height="60" rx="8"
          fill="#0C1018" stroke="rgba(124,109,250,0.22)" strokeWidth="1" />
        <text x="10" y="18" fontSize="8"  fill="rgba(124,109,250,0.65)"
          fontFamily="monospace" letterSpacing="1">NET WORTH</text>
        <text x="10" y="38" fontSize="17" fill="#E8E6FF"
          fontFamily="Syne, sans-serif" fontWeight="700">$48,320</text>
        <text x="10" y="54" fontSize="9"  fill="rgba(52,211,153,0.85)"
          fontFamily="monospace">▲ +2.4%</text>
      </g>

      {/* Risk node — top right */}
      <g transform="translate(370,82)">
        <rect width="90" height="60" rx="8"
          fill="#0C1018" stroke="rgba(245,158,11,0.22)" strokeWidth="1" />
        <text x="10" y="18" fontSize="8"  fill="rgba(245,158,11,0.65)"
          fontFamily="monospace" letterSpacing="1">RISK LEVEL</text>
        <text x="10" y="38" fontSize="15" fill="#F59E0B"
          fontFamily="Syne, sans-serif" fontWeight="700">MEDIUM</text>
        <rect x="10" y="44" width="48" height="4" rx="2"
          fill="rgba(245,158,11,0.12)" />
        <rect x="10" y="44" width="30" height="4" rx="2"
          fill="rgba(245,158,11,0.55)" />
      </g>

      {/* ETH Balance node — bottom right */}
      <g transform="translate(372,324)">
        <rect width="96" height="60" rx="8"
          fill="#0C1018" stroke="rgba(98,126,234,0.28)" strokeWidth="1" />
        <text x="10" y="18" fontSize="8"  fill="rgba(98,126,234,0.75)"
          fontFamily="monospace" letterSpacing="1">ETH BALANCE</text>
        <text x="10" y="38" fontSize="15" fill="#E8E6FF"
          fontFamily="Syne, sans-serif" fontWeight="700">12.4 Ξ</text>
        <text x="10" y="54" fontSize="9"  fill="rgba(248,113,113,0.75)"
          fontFamily="monospace">▼ -3.2%</text>
      </g>

      {/* AI thinking node — bottom left */}
      <g transform="translate(42,320)">
        <rect width="104" height="52" rx="8"
          fill="rgba(124,109,250,0.09)" stroke="rgba(124,109,250,0.28)" strokeWidth="1" />
        <text x="10" y="18" fontSize="9"  fill="rgba(124,109,250,0.75)"
          fontFamily="monospace" letterSpacing="1">ØRACLE</text>
        <text x="10" y="34" fontSize="10" fill="#C8C6E0"
          fontFamily="monospace">Analyzing...</text>
        <circle cx="12" cy="45" r="2.5" fill="rgba(124,109,250,0.75)"
          style={{ animation: 'blink 1.2s 0s infinite' }} />
        <circle cx="22" cy="45" r="2.5" fill="rgba(124,109,250,0.75)"
          style={{ animation: 'blink 1.2s 0.2s infinite' }} />
        <circle cx="32" cy="45" r="2.5" fill="rgba(124,109,250,0.75)"
          style={{ animation: 'blink 1.2s 0.4s infinite' }} />
      </g>

      {/* Connector dashes */}
      <line x1="150" y1="214" x2="150" y2="128" stroke="rgba(124,109,250,0.15)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="370" y1="204" x2="416" y2="115" stroke="rgba(245,158,11,0.15)"  strokeWidth="1" strokeDasharray="4 4" />
      <line x1="370" y1="274" x2="418" y2="352" stroke="rgba(98,126,234,0.15)"  strokeWidth="1" strokeDasharray="4 4" />
      <line x1="150" y1="274" x2="146" y2="344" stroke="rgba(124,109,250,0.15)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Pulse rings from center */}
      <circle cx="260" cy="240" r="24"
        stroke="rgba(124,109,250,0.38)" strokeWidth="1"
        style={{ transformOrigin: '260px 240px', animation: 'pulse-ring 2.2s ease-out infinite' }} />
      <circle cx="260" cy="240" r="24"
        stroke="rgba(124,109,250,0.18)" strokeWidth="1"
        style={{ transformOrigin: '260px 240px', animation: 'pulse-ring 2.2s 0.75s ease-out infinite' }} />

      {/* Ambient particles */}
      <circle cx="205" cy="135" r="2.5" fill="rgba(124,109,250,0.45)"
        style={{ animation: 'blink 3.2s 0.5s infinite' }} />
      <circle cx="318" cy="148" r="2"   fill="rgba(56,189,248,0.45)"
        style={{ animation: 'blink 2.5s 1.1s infinite' }} />
      <circle cx="348" cy="302" r="2.5" fill="rgba(52,211,153,0.45)"
        style={{ animation: 'blink 3.5s 0.2s infinite' }} />
      <circle cx="166" cy="310" r="2"   fill="rgba(245,158,11,0.45)"
        style={{ animation: 'blink 2.1s 0.8s infinite' }} />
      <circle cx="260" cy="112" r="2.5" fill="rgba(124,109,250,0.35)"
        style={{ animation: 'blink 4s 0.3s infinite' }} />
      <circle cx="188" cy="385" r="2"   fill="rgba(56,189,248,0.35)"
        style={{ animation: 'blink 3.1s 1.4s infinite' }} />
      <circle cx="340" cy="178" r="2"   fill="rgba(52,211,153,0.35)"
        style={{ animation: 'blink 2.8s 0.7s infinite' }} />

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

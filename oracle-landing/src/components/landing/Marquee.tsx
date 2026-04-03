const ITEMS = [
  'NET WORTH TRACKING',
  'AI CHAT INTERFACE',
  'SEND ETH VIA CHAT',
  'RISK ANALYSIS',
  'TRANSACTION HISTORY',
  'WALLET CONNECT V3',
  'MORALIS POWERED',
  'MULTI-CHAIN SUPPORT',
  'ERC-20 TOKENS',
  'DEFI ANALYTICS',
]

export function Marquee() {
  // Duplicate for seamless loop
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div
      className="marquee-wrap"
      style={{
        overflow:     'hidden',
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background:   'var(--bg2)',
        padding:      '15px 0',
        position:     'relative',
        zIndex:       1,
      }}
      onMouseEnter={e => {
        const track = e.currentTarget.querySelector('.marquee-track') as HTMLElement | null
        if (track) track.style.animationPlayState = 'paused'
      }}
      onMouseLeave={e => {
        const track = e.currentTarget.querySelector('.marquee-track') as HTMLElement | null
        if (track) track.style.animationPlayState = 'running'
      }}
    >
      <div
        className="marquee-track"
        style={{
          display:   'flex',
          width:     'max-content',
          animation: 'marquee 34s linear infinite',
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="marquee-item"
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         10,
              padding:     '0 40px',
              whiteSpace:  'nowrap',
              fontSize:    11,
              color:       'var(--muted)',
              letterSpacing: 2,
              fontFamily:  'var(--font-mono)',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: 10 }}>◆</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

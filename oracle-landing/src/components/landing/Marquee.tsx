import React from 'react'
const ITEMS = [
  'NET WORTH TRACKING', 'AI CHAT INTERFACE', 'SEND ETH VIA CHAT',
  'RISK ANALYSIS', 'TRANSACTION HISTORY', 'WALLET CONNECT V3',
  'MORALIS POWERED', 'MULTI-CHAIN SUPPORT', 'ERC-20 TOKENS', 'DEFI ANALYTICS',
]

export function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="marquee-wrap" style={{
      overflow: 'hidden',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(12,15,26,0.6)',
      padding: '16px 0',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: 'marquee 32s linear infinite',
      }}>
        {doubled.map((item, i) => (
          <div key={i} className="marquee-item" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 40px', whiteSpace: 'nowrap',
            fontSize: 11, color: 'var(--muted)', letterSpacing: 2,
          }}>
            <span style={{ color: 'var(--accent)' }}>◆</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

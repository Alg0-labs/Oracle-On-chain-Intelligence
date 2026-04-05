import React from 'react'
import {
  NetworkEthereum,
  NetworkArbitrumOne,
  NetworkPolygon,
  NetworkOptimism,
  NetworkBase,
  NetworkAvalanche,
  NetworkBinanceSmartChain,
  NetworkFantom,
  NetworkZksync,
  NetworkLinea,
  NetworkScroll,
  NetworkBlast,
  NetworkMantle,
  NetworkCelo,
  NetworkGnosis,
  NetworkMoonbeam,
} from '@web3icons/react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const NETWORKS = [
  { name: 'Ethereum',     abbr: 'ETH',    Icon: NetworkEthereum          },
  { name: 'Arbitrum',     abbr: 'ARB',    Icon: NetworkArbitrumOne       },
  { name: 'Polygon',      abbr: 'MATIC',  Icon: NetworkPolygon           },
  { name: 'Optimism',     abbr: 'OP',     Icon: NetworkOptimism          },
  { name: 'Base',         abbr: 'BASE',   Icon: NetworkBase              },
  { name: 'Avalanche',    abbr: 'AVAX',   Icon: NetworkAvalanche         },
  { name: 'BNB Chain',    abbr: 'BNB',    Icon: NetworkBinanceSmartChain },
  { name: 'Fantom',       abbr: 'FTM',    Icon: NetworkFantom            },
  { name: 'zkSync Era',   abbr: 'ZK',     Icon: NetworkZksync            },
  { name: 'Linea',        abbr: 'LINEA',  Icon: NetworkLinea             },
  { name: 'Scroll',       abbr: 'SCROLL', Icon: NetworkScroll            },
  { name: 'Blast',        abbr: 'BLAST',  Icon: NetworkBlast             },
  { name: 'Mantle',       abbr: 'MNT',    Icon: NetworkMantle            },
  { name: 'Celo',         abbr: 'CELO',   Icon: NetworkCelo              },
  { name: 'Gnosis',       abbr: 'GNO',    Icon: NetworkGnosis            },
  { name: 'Moonbeam',     abbr: 'GLMR',   Icon: NetworkMoonbeam          },
]

const ROW1 = [...NETWORKS.slice(0, 8),  ...NETWORKS.slice(0, 8)]
const ROW2 = [...NETWORKS.slice(8, 16), ...NETWORKS.slice(8, 16)]

export function Networks() {
  const ref = useScrollReveal()

  return (
    <section
      id="networks"
      style={{
        padding:    '88px 0',
        background: 'var(--bg2)',
        position:   'relative',
        zIndex:     1,
        overflow:   'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position:      'absolute',
        top: '50%', left: '50%',
        transform:     'translate(-50%,-50%)',
        width:         700,
        height:        300,
        background:    'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div ref={ref} className="reveal-section">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52, padding: '0 24px' }}>
          <div className="section-tag">// Supported Networks</div>
          <h2 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(26px, 3.5vw, 44px)',
            fontWeight:    700,
            letterSpacing: '-1.2px',
            color:         'var(--text)',
            marginBottom:  14,
            lineHeight:    1.1,
          }}>
            Every EVM chain.<br />One intelligence layer.
          </h2>
          <p style={{
            fontSize:   15,
            color:      'var(--muted)',
            maxWidth:   440,
            margin:     '0 auto',
            lineHeight: 1.7,
          }}>
            ØRACLE aggregates portfolio data, transactions, and risk across all major EVM-compatible networks in real time.
          </p>
        </div>

        {/* Row 1 — scrolls left */}
        <MarqueeRow items={ROW1} duration={34} reverse={false} />
        <div style={{ height: 10 }} />
        {/* Row 2 — scrolls right */}
        <MarqueeRow items={ROW2} duration={40} reverse={true} />

        {/* Badge */}
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <span style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          8,
            padding:      '6px 18px',
            background:   'rgba(99,102,241,0.07)',
            border:       '1px solid rgba(99,102,241,0.16)',
            borderRadius: 999,
            fontSize:     12,
            color:        '#818CF8',
            fontFamily:   'var(--font-mono)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#6366F1',
              boxShadow:  '0 0 8px rgba(99,102,241,0.8)',
              display:    'inline-block',
              animation:  'glow-pulse 2s ease-in-out infinite',
            }} />
            16 EVM networks supported · More coming soon
          </span>
        </div>
      </div>
    </section>
  )
}

type NetworkItem = typeof NETWORKS[number]

function MarqueeRow({ items, duration, reverse }: {
  items: NetworkItem[]
  duration: number
  reverse: boolean
}) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={fadeLeft} />
      <div style={fadeRight} />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div style={{
          display:    'flex',
          gap:        10,
          animation:  `networks-scroll ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
          willChange: 'transform',
        }}>
          {items.map((n, i) => <NetworkPill key={i} {...n} />)}
        </div>
      </div>
    </div>
  )
}

function NetworkPill({ name, abbr, Icon }: NetworkItem) {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          12,
      padding:      '10px 18px',
      background:   'var(--bg3)',
      border:       '1px solid var(--border)',
      borderRadius: 10,
      flexShrink:   0,
      whiteSpace:   'nowrap' as const,
    }}>
      <div style={{
        width:          36,
        height:         36,
        borderRadius:   8,
        background:     'var(--bg4)',
        border:         '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        overflow:       'hidden',
      }}>
        <Icon variant="branded" size={22} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 }}>
          {name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1, marginTop: 3, fontFamily: 'var(--font-mono)' }}>
          {abbr}
        </div>
      </div>
    </div>
  )
}

const fadeLeft: React.CSSProperties = {
  position:      'absolute',
  left:          0, top: 0, bottom: 0,
  width:         100,
  background:    'linear-gradient(90deg, var(--bg2) 0%, transparent 100%)',
  zIndex:        2,
  pointerEvents: 'none',
}

const fadeRight: React.CSSProperties = {
  position:      'absolute',
  right:         0, top: 0, bottom: 0,
  width:         100,
  background:    'linear-gradient(270deg, var(--bg2) 0%, transparent 100%)',
  zIndex:        2,
  pointerEvents: 'none',
}

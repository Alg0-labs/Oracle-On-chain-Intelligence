import type { MarketData, WalletData } from '../types/index.js'

interface Props {
  market: MarketData | null
  wallet: WalletData
}

function sentimentColor(s: string) {
  if (s === 'bullish') return '#22C55E'
  if (s === 'bearish') return '#EF4444'
  return '#F59E0B'
}

function importanceColor(imp: string) {
  if (imp === 'high')   return { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' }
  if (imp === 'medium') return { color: '#A1A1AA', bg: 'rgba(161,161,170,0.08)', border: 'rgba(161,161,170,0.2)' }
  return { color: '#52525B', bg: 'transparent', border: 'rgba(82,82,91,0.2)' }
}

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts * 1000) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function MarketPanel({ market, wallet }: Props) {
  if (!market) {
    return (
      <div style={panel}>
        <header style={pageHeader}>
          <h1 style={pageTitle}>Market Intelligence</h1>
        </header>
        <div style={body}>
          <div style={emptyState}>
            <div style={emptyIcon}>⊕</div>
            <p style={emptyTitle}>Market data unavailable</p>
            <p style={emptyDesc}>Market intelligence couldn't be loaded. Try refreshing your portfolio.</p>
          </div>
        </div>
      </div>
    )
  }

  const fg = market.fearGreed
  const fgColor = fg.value < 25 ? '#EF4444'
                : fg.value < 45 ? '#F97316'
                : fg.value < 55 ? '#F59E0B'
                : fg.value < 75 ? '#84CC16'
                : '#22C55E'

  return (
    <div style={panel}>
      {/* Header */}
      <header style={pageHeader}>
        <h1 style={pageTitle}>Market Intelligence</h1>
        <span style={syncLbl}>
          Updated {timeAgo(market.fetchedAt / 1000)}
        </span>
      </header>

      <div style={body}>

        {/* ── Indicator row ── */}
        <div style={indicatorGrid}>

          {/* Fear & Greed */}
          <div style={card}>
            <div style={statLabel}>FEAR & GREED INDEX</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
              <span style={{ ...bigVal, color: fgColor }}>{fg.value}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: fgColor }}>{fg.label}</span>
            </div>
            <div style={{ marginTop: 12, height: 6, background: '#27272F', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${fg.value}%`,
                background: `linear-gradient(90deg, #EF4444, #F59E0B, #22C55E)`,
                borderRadius: 3,
              }} />
            </div>
            <div style={{ ...statSub, marginTop: 6 }}>{fg.trend}</div>
          </div>

          {/* Portfolio sentiment */}
          <div style={card}>
            <div style={statLabel}>PORTFOLIO SENTIMENT</div>
            {market.portfolioImpact.length > 0 ? (
              <>
                <div style={{ ...bigVal, fontSize: 20, marginTop: 8, color: sentimentColor(market.portfolioImpact[0]?.sentiment) }}>
                  {market.portfolioImpact[0]?.sentiment?.toUpperCase()}
                </div>
                <div style={{ ...statSub, marginTop: 6 }}>
                  Based on {market.portfolioImpact.length} portfolio position{market.portfolioImpact.length !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <div style={{ ...statSub, marginTop: 12 }}>No impact data available</div>
            )}
          </div>

          {/* Top impact */}
          {market.portfolioImpact.slice(0, 2).map(imp => (
            <div key={imp.token} style={card}>
              <div style={statLabel}>{imp.token} IMPACT</div>
              <div style={{ ...bigVal, fontSize: 18, marginTop: 8, color: sentimentColor(imp.sentiment) }}>
                {imp.sentiment.toUpperCase()}
              </div>
              <div style={{ ...statSub, marginTop: 6 }}>
                {imp.percentOfPortfolio.toFixed(1)}% of portfolio ·{' '}
                <span style={{ color: imp.priceChange24h >= 0 ? '#22C55E' : '#EF4444' }}>
                  {imp.priceChange24h >= 0 ? '+' : ''}{imp.priceChange24h.toFixed(2)}% 24h
                </span>
              </div>
            </div>
          ))}

        </div>

        {/* ── Main content: news feed + AI insights ── */}
        <div style={twoCol}>

          {/* News feed */}
          <div style={card}>
            <div style={cardHead}>
              <span style={cardTitle}>Latest News</span>
              <span style={cardMeta}>{market.relevantNews.length} articles</span>
            </div>

            {market.relevantNews.length > 0 ? market.relevantNews.map((n, i) => {
              const imp = importanceColor(n.importance)
              return (
                <a
                  key={n.id}
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...newsRow, borderBottom: i < market.relevantNews.length - 1 ? '1px solid var(--border)' : 'none', display: 'block', textDecoration: 'none', borderRadius: 6, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ ...impPill, color: imp.color, background: imp.bg, borderColor: imp.border }}>
                      {n.importance.toUpperCase()}
                    </span>
                    <span style={newsSource}>{n.source} · {timeAgo(n.publishedAt)}</span>
                    <span style={{ marginLeft: 'auto', ...sentimentPill, color: sentimentColor(n.sentiment), background: `${sentimentColor(n.sentiment)}10`, borderColor: `${sentimentColor(n.sentiment)}25` }}>
                      {n.sentiment.toUpperCase()}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-6)', flexShrink: 0 }}>
                      <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={newsTitle}>{n.title}</p>
                  <p style={newsSummary}>{n.summary}</p>
                </a>
              )
            }) : (
              <p style={emptyMsgSm}>No relevant news found</p>
            )}
          </div>

          {/* Right column: AI insights + portfolio impact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* AI Insights */}
            {market.latestNewsInsights.length > 0 && (
              <div style={card}>
                <div style={cardHead}>
                  <span style={cardTitle}>ØRACLE Insights</span>
                </div>
                {market.latestNewsInsights.slice(0, 3).map((ins, i) => (
                  <div key={ins.id} style={{
                    ...insightRow,
                    borderBottom: i < Math.min(market.latestNewsInsights.length, 3) - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={insightHeader}>
                      <span style={{ ...sentimentPill, color: sentimentColor(ins.sentiment), background: `${sentimentColor(ins.sentiment)}10`, borderColor: `${sentimentColor(ins.sentiment)}25` }}>
                        {ins.sentiment.toUpperCase()}
                      </span>
                      <span style={newsSource}>{ins.source} · {timeAgo(ins.publishedAt)}</span>
                    </div>
                    <a href={ins.url} target="_blank" rel="noreferrer" style={{ ...insightTitle, textDecoration: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                      <span>{ins.title}</span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-6)', flexShrink: 0, marginTop: 2 }}>
                        <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                    {ins.aiReasoning && (
                      <div style={aiBox}>
                        <span style={aiLabel}>Ø ANALYSIS</span>
                        <p style={aiText}>{ins.aiReasoning}</p>
                      </div>
                    )}
                    {ins.fearGreedConnection && (
                      <p style={fearGreedNote}>{ins.fearGreedConnection}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio impact detail */}
            {market.portfolioImpact.length > 0 && (
              <div style={card}>
                <div style={cardHead}>
                  <span style={cardTitle}>Your Portfolio Impact</span>
                </div>
                {market.portfolioImpact.map((imp, i) => (
                  <div key={imp.token} style={{
                    ...impactRow,
                    borderBottom: i < market.portfolioImpact.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={impactToken}>{imp.token}</span>
                      <span style={impactPct}> · {imp.percentOfPortfolio.toFixed(1)}% of portfolio</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ ...sentimentPill, color: sentimentColor(imp.sentiment), background: `${sentimentColor(imp.sentiment)}10`, borderColor: `${sentimentColor(imp.sentiment)}25` }}>
                        {imp.sentiment.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: imp.priceChange24h >= 0 ? '#22C55E' : '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
                        {imp.priceChange24h >= 0 ? '+' : ''}{imp.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const panel: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg)' }

const pageHeader: React.CSSProperties = {
  height: 52, borderBottom: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 24px', flexShrink: 0, background: 'var(--bg)',
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const pageTitle: React.CSSProperties = {
  fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em',
}

const syncLbl: React.CSSProperties = { fontSize: 11, color: 'var(--text-5)' }

const body: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
}

const indicatorGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 18,
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const cardHead: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
}

const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }
const cardMeta: React.CSSProperties  = { fontSize: 11, color: 'var(--text-5)' }

const statLabel: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: 'var(--text-5)', letterSpacing: '0.1em' }
const statSub: React.CSSProperties   = { fontSize: 11, color: 'var(--text-4)' }

const bigVal: React.CSSProperties = {
  fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums',
  color: 'var(--text)',
}

const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 12 }

const newsRow: React.CSSProperties = { padding: '14px 0' }

const impPill: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px',
  borderRadius: 999, border: '1px solid', flexShrink: 0,
}

const sentimentPill: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 7px',
  borderRadius: 999, border: '1px solid',
}

const newsSource: React.CSSProperties = { fontSize: 11, color: 'var(--text-5)' }
const newsTitle: React.CSSProperties  = {
  fontSize: 13, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 4,
  textDecoration: 'none', lineHeight: 1.4,
}
const newsSummary: React.CSSProperties = { fontSize: 12, color: 'var(--text-4)', lineHeight: 1.5, margin: 0 }

const insightRow: React.CSSProperties  = { padding: '14px 0' }
const insightHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }
const insightTitle: React.CSSProperties  = { fontSize: 13, fontWeight: 500, color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 10px' }

const aiBox: React.CSSProperties = {
  background: 'var(--accent-glow)', border: '1px solid var(--accent-bd)',
  borderRadius: 6, padding: '10px 12px', marginBottom: 8,
  overflow: 'visible',
}
const aiLabel: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', display: 'block', marginBottom: 4,
}
const aiText: React.CSSProperties = {
  fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7, margin: 0,
  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
}
const fearGreedNote: React.CSSProperties = { fontSize: 11, color: 'var(--text-5)', margin: 0, fontStyle: 'italic' }

const impactRow: React.CSSProperties  = { display: 'flex', alignItems: 'center', padding: '10px 0' }
const impactToken: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--text)' }
const impactPct: React.CSSProperties   = { fontSize: 11, color: 'var(--text-4)' }

const emptyState: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  flex: 1, gap: 12,
}
const emptyIcon: React.CSSProperties  = { fontSize: 32 }
const emptyTitle: React.CSSProperties = { fontSize: 15, fontWeight: 500, color: 'var(--text-4)' }
const emptyDesc: React.CSSProperties  = { fontSize: 13, color: 'var(--text-5)', textAlign: 'center', maxWidth: 320 }
const emptyMsgSm: React.CSSProperties = { fontSize: 12, color: 'var(--text-5)', textAlign: 'center', padding: '16px 0' }

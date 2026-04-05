import { useAppKit } from '@reown/appkit/react'
import type { CSSProperties } from 'react'
import type { WalletData, MarketData, NativeBalance } from '../types/index.js'

// ─── Token / Chain helpers ────────────────────────────────────────────────────

const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA', WETH: '#627EEA',
  BTC: '#F7931A', WBTC: '#F7931A',
  USDC: '#2775CA', USDT: '#26A17B', DAI: '#F5AC37',
  SOL: '#9945FF', ARB: '#12AAFF', OP: '#FF0420',
  MATIC: '#8247E5', POL: '#8247E5', LINK: '#375BD2', UNI: '#FF007A',
  AAVE: '#B6509E', MKR: '#1AAB9B', BNB: '#F3BA2F', AVAX: '#E84142',
}
function tokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol.toUpperCase()] ?? '#6366F1'
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: '#627EEA', Polygon: '#8247E5', BSC: '#F3BA2F',
  Arbitrum: '#12AAFF', Optimism: '#FF0420', Base: '#0052FF', Avalanche: '#E84142',
}
function chainColor(chain: string): string {
  return CHAIN_COLORS[chain] ?? '#6366F1'
}

function ChainBadge({ chain }: { chain: string }) {
  const short: Record<string, string> = {
    Ethereum: 'ETH', Polygon: 'POLY', BSC: 'BSC',
    Arbitrum: 'ARB', Optimism: 'OP', Base: 'BASE', Avalanche: 'AVAX',
  }
  const label = short[chain] ?? chain.slice(0, 4).toUpperCase()
  const color = chainColor(chain)
  return (
    <span style={{
      fontSize: 8, fontWeight: 600, letterSpacing: 0.8,
      color, background: `${color}18`, border: `1px solid ${color}33`,
      borderRadius: 999, padding: '1px 6px',
      fontFamily: 'var(--font-data)', flexShrink: 0,
    }}>{label}</span>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface Props {
  wallet: WalletData
  market: MarketData | null
  isMobile?: boolean
}

export function PortfolioPanel({ wallet, market, isMobile = false }: Props) {
  const { open } = useAppKit()

  const nativeAssets = (wallet.nativeBalances ?? [])
    .filter(n => parseFloat(n.balance) > 0 || n.balanceUsd > 0)
    .map((n: NativeBalance) => ({
      symbol: n.symbol,
      name: n.chain === 'Ethereum' ? 'Ethereum' : `${n.name} (native)`,
      usdValue: n.balanceUsd,
      balance: n.balance,
      change24h: undefined as number | undefined,
      chain: n.chain,
      chainId: n.chainId,
    }))

  const allAssets = [...nativeAssets, ...wallet.tokens]
  const total = wallet.netWorthUsd || 1
  const chainBreakdown = wallet.chainBreakdown ?? []

  // ETH price derived from wallet data
  const ethBal = parseFloat(wallet.ethBalance)
  const ethPrice = ethBal > 0 ? Math.round(wallet.ethBalanceUsd / ethBal) : null
  const ethImpact = market?.portfolioImpact.find(p => p.token === 'ETH')
  const ethChange = ethImpact?.priceChange24h ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Page header */}
      <header style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, background: 'var(--bg)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>Portfolio</h1>
        <span style={{ fontSize: 11, color: 'var(--text-5)' }}>
          ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} total
        </span>
      </header>

      <div style={panel}>
        <div style={{ ...twoCol, flexDirection: isMobile ? 'column' : 'row' }}>

          {/* ── LEFT: Holdings ─────────────────────────────────────────────── */}
          <div style={leftCol}>

            {/* Portfolio value + chain bar */}
            <div style={netWorthCard}>
              <div style={sectionLabel}>TOTAL PORTFOLIO VALUE</div>
              <div style={netWorthValue}>
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {chainBreakdown.length > 1 && (
                <>
                  <div style={{ height: 4, borderRadius: 2, display: 'flex', overflow: 'hidden', marginTop: 14, background: 'var(--bg-muted)' }}>
                    {chainBreakdown.map(c => (
                      <div key={c.chain}
                        style={{ width: `${(c.usdValue / total) * 100}%`, background: chainColor(c.chain), height: '100%', transition: 'width 0.8s ease' }}
                        title={`${c.chain}: $${c.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {chainBreakdown.map(c => (
                      <div key={c.chain} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: chainColor(c.chain), flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-5)', fontSize: 10, fontFamily: 'var(--font-data)' }}>
                          {c.chain} · ${c.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({((c.usdValue / total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Holdings list */}
            <div style={sectionLabel}>HOLDINGS</div>
            <div style={holdingsList}>
              {allAssets.map((t, i) => {
                const pct = ((t.usdValue / total) * 100).toFixed(1)
                const key = `${t.symbol}-${'chain' in t ? t.chain : ''}-${i}`
                return (
                  <div key={key} style={holdingRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `${tokenColor(t.symbol)}22`,
                        border: `1px solid ${tokenColor(t.symbol)}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: tokenColor(t.symbol) }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={symStyle}>{t.symbol}</span>
                          {'chain' in t && t.chain && <ChainBadge chain={t.chain} />}
                        </div>
                        <div style={nameStyle}>{t.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={valStyle}>${t.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                        {t.change24h !== undefined && (
                          <span style={{ fontSize: 11, color: t.change24h >= 0 ? '#4ADE80' : '#F87171', fontFamily: 'var(--font-data)' }}>
                            {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(1)}%
                          </span>
                        )}
                        <span style={pctStyle}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Allocation bar */}
            <div style={{ marginTop: 20 }}>
              <div style={sectionLabel}>ALLOCATION</div>
              <div style={allocBar}>
                {allAssets.map((t, i) => (
                  <div key={`alloc-${i}`}
                    style={{ width: `${(t.usdValue / total) * 100}%`, background: tokenColor(t.symbol), height: '100%', transition: 'width 0.8s ease' }}
                    title={`${t.symbol} ${((t.usdValue / total) * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {allAssets.map((t, i) => (
                  <div key={`legend-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: tokenColor(t.symbol) }} />
                    <span style={{ color: 'var(--text-5)', fontSize: 10, fontFamily: 'var(--font-data)' }}>{t.symbol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NFTs */}
            {wallet.nfts.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={sectionLabel}>NFTS</div>
                <div style={{ color: 'var(--text-5)', fontSize: 12, fontFamily: 'var(--font-data)' }}>
                  {wallet.nfts.length} NFTs held
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: ETH Price + Buy/Swap ─────────────────────────────────── */}
          <div style={rightCol}>

            {/* ETH Live Price */}
            <div style={glassCard}>
              <div style={cardSectionLabel}>ETH LIVE PRICE</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                  {ethPrice != null ? `$${ethPrice.toLocaleString()}` : '—'}
                </span>
                {ethChange != null && (
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: ethChange >= 0 ? '#22C55E' : '#EF4444',
                  }}>
                    {ethChange >= 0 ? '+' : ''}{ethChange.toFixed(2)}%
                  </span>
                )}
              </div>
              {ethChange != null && (
                <div style={{ marginTop: 12, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(Math.abs(ethChange) * 10, 100)}%`,
                    background: ethChange >= 0 ? '#22C55E' : '#EF4444',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              )}
              <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-5)', letterSpacing: 1.5, fontFamily: 'var(--font-data)', fontWeight: 600 }}>YOUR BALANCE</div>
                  <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                    {parseFloat(wallet.ethBalance).toFixed(4)} ETH
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-5)', letterSpacing: 1.5, fontFamily: 'var(--font-data)', fontWeight: 600 }}>VALUE</div>
                  <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                    ${wallet.ethBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
              {ethImpact && (
                <div style={{
                  marginTop: 14, padding: '8px 10px', borderRadius: 6,
                  background: 'var(--accent-glow)', border: '1px solid var(--accent-bd)',
                }}>
                  <span style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 1.5, fontFamily: 'var(--font-data)', fontWeight: 700 }}>
                    SENTIMENT
                  </span>
                  <div style={{ fontSize: 12, color: ethImpact.sentiment === 'bullish' ? '#22C55E' : ethImpact.sentiment === 'bearish' ? '#EF4444' : '#F59E0B', fontWeight: 600, marginTop: 3 }}>
                    {ethImpact.sentiment.toUpperCase()} · {ethImpact.percentOfPortfolio.toFixed(1)}% of portfolio
                  </div>
                </div>
              )}
            </div>

            {/* Buy / Swap */}
            <div style={glassCard}>
              <div style={cardSectionLabel}>TRADE</div>
              <p style={{ fontSize: 12, color: 'var(--text-4)', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'var(--font-body)' }}>
                Buy crypto with fiat or swap tokens directly from your connected wallet.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  style={buyBtn}
                  onClick={() => open({ view: 'OnRampProviders' })}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v12M3 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Buy Crypto
                </button>
                <button
                  style={swapBtn}
                  onClick={() => open({ view: 'Swap' })}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 5h10M10 2l3 3-3 3M13 11H3M6 8l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Swap Tokens
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const panel: CSSProperties = { flex: 1, overflowY: 'auto', padding: '20px 20px 40px', background: 'var(--bg)' }

const twoCol: CSSProperties = {
  display: 'flex', gap: 20, alignItems: 'flex-start',
}

const leftCol: CSSProperties = { flex: '1 1 60%', minWidth: 0 }
const rightCol: CSSProperties = { flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }

const netWorthCard: CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
  padding: '18px 20px', marginBottom: 20,
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const netWorthValue: CSSProperties = {
  fontSize: 32, fontWeight: 600, color: 'var(--text)',
  fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
  lineHeight: 1, marginTop: 4,
}

const sectionLabel: CSSProperties = {
  fontSize: 9, color: 'var(--text-5)', letterSpacing: 2.5,
  marginBottom: 12, fontFamily: 'var(--font-data)', fontWeight: 600,
}

const cardSectionLabel: CSSProperties = {
  fontSize: 9, color: 'var(--accent)', letterSpacing: 2.5,
  marginBottom: 14, fontFamily: 'var(--font-data)', fontWeight: 600,
}

const holdingsList: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2 }

const holdingRow: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 10px', borderRadius: 8,
  transition: 'background 0.15s',
}

const symStyle: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: 'var(--text)',
  fontFamily: 'var(--font-data)',
}

const nameStyle: CSSProperties = {
  fontSize: 11, color: 'var(--text-5)', marginTop: 2,
  fontFamily: 'var(--font-body)',
}

const valStyle: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: 'var(--text)',
  fontFamily: 'var(--font-data)',
}

const pctStyle: CSSProperties = {
  fontSize: 11, color: 'var(--text-5)',
  fontFamily: 'var(--font-data)',
}

const allocBar: CSSProperties = {
  height: 6, borderRadius: 3, display: 'flex', overflow: 'hidden',
  background: 'var(--bg-muted)',
}

const glassCard: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12, padding: '18px 18px',
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const buyBtn: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  width: '100%', height: 40,
  background: 'var(--accent)', color: '#fff',
  border: 'none', borderRadius: 8,
  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
  cursor: 'pointer', transition: 'opacity 0.15s',
}

const swapBtn: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  width: '100%', height: 40,
  background: 'transparent', color: 'var(--text-3)',
  border: '1px solid var(--border)', borderRadius: 8,
  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
  cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
}

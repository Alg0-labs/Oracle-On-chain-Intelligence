import { useState, useRef, useCallback } from 'react'
import { runQuickCheck, startDeepAnalysis, pollStatus, getReport } from '../lib/copilot-api.js'
import type { WalletData, QuickCheckResult, DeepAnalysisResult } from '../types/index.js'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_FAILURES = 8

const ASSETS = [
  { symbol: 'ETH',  name: 'Ethereum',  color: '#627EEA' },
  { symbol: 'SOL',  name: 'Solana',    color: '#9945FF' },
  { symbol: 'MATIC',name: 'Polygon',   color: '#8247E5' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { symbol: 'BNB',  name: 'BNB Chain', color: '#F3BA2F' },
]

const DEEP_AGENTS = [
  { key: 'market',    label: 'Market Analyst',      icon: '📈' },
  { key: 'sentiment', label: 'Sentiment Analyst',   icon: '🧠' },
  { key: 'news',      label: 'News Analyst',        icon: '📰' },
  { key: 'onchain',   label: 'On-Chain Analyst',    icon: '🔗' },
  { key: 'debate',    label: 'Bull vs Bear Debate', icon: '⚔️' },
  { key: 'decision',  label: 'Decision Maker',      icon: '⚖️' },
  { key: 'risk',      label: 'Risk Calculator',     icon: '🛡️' },
]

const TIP = {
  rsi:        'RSI 0–100. Under 30 = oversold (possible buy). Over 70 = overbought (pullback risk). 40–60 = healthy range.',
  macd:       'MACD histogram positive = buying pressure building. Negative = selling pressure. Crossover above signal line = new uptrend.',
  fearGreed:  'Extreme Fear (0–24) = panic, often a contrarian buy. Extreme Greed (75–100) = euphoria, historically risky to buy.',
  whales:     'Whale Activity: Accumulation = big wallets buying. Distribution = big wallets selling into strength.',
  news:       'News Sentiment: scans recent crypto headlines. Breaking news = something major happened today.',
  confidence: 'Signal Confidence: 90%+ = all data sources responded. Below 50% = limited data, rough guidance only.',
  severity:   'EXECUTE = favorable signals. CAUTION = proceed carefully. AVOID = multiple warning signs, consider waiting.',
  positionSize:'Suggested % of total portfolio to allocate. Never exceed your own risk limits.',
  stopLoss:   'Exit the trade at this price to cap losses. Always set before entering.',
  takeProfit: 'Target price to lock in gains — based on 2:1 reward-to-risk.',
  riskReward: '2:1 means for every $1 risked you stand to gain $2. Professionals rarely trade below 2:1.',
  volume:     'Volume vs 7-day average. 2x = twice normal activity. High volume on price rise = strong conviction.',
}

const C = {
  bg:        '#060608',
  panel:     '#0D0D10',
  panelB:    '#13131A',
  border:    '#1E1E28',
  borderHi:  '#2A2A38',
  text:      '#D4D4DC',
  textDim:   '#808090',
  textFaint: '#505060',
  amber:     '#F0A500',
  green:     '#00C896',
  red:       '#E8394A',
  blue:      '#4A8FE8',
  purple:    '#9945FF',
  white:     '#F0F0F8',
}

type ArenaStatus = 'idle' | 'checking' | 'checked' | 'analyzing' | 'analyzed' | 'error'
type RiskTol     = 'low' | 'moderate' | 'high'

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ color: C.textFaint, fontSize: 10, cursor: 'help', userSelect: 'none', marginLeft: 3 }}>ⓘ</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: '#18181F', border: `1px solid ${C.borderHi}`,
          borderRadius: 6, padding: '10px 14px', fontSize: 11, color: '#C0C0CC',
          width: 240, lineHeight: 1.7, zIndex: 999,
          boxShadow: '0 12px 40px rgba(0,0,0,0.9)',
          whiteSpace: 'normal', pointerEvents: 'none',
        }}>{text}</div>
      )}
    </span>
  )
}

// ── Confidence bar ────────────────────────────────────────────────────────────
function ConfBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? C.green : pct >= 50 ? C.amber : C.red
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ fontSize: 9, color: C.textDim, letterSpacing: '0.08em', flexShrink: 0 }}>{label}</span>}
      <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 10, color, fontFamily: 'monospace', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

// ── RSI gauge ─────────────────────────────────────────────────────────────────
function RSIBar({ rsi }: { rsi: number }) {
  const pct = Math.max(0, Math.min(100, rsi))
  const color = rsi < 30 ? C.red : rsi > 70 ? C.red : C.green
  return (
    <div>
      <div style={{ position: 'relative', height: 5, borderRadius: 3, background: C.border }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: '30%', height: '100%', background: `${C.red}20`, borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, width: '30%', height: '100%', background: `${C.red}20`, borderRadius: '0 3px 3px 0' }} />
        <div style={{
          position: 'absolute', left: `${pct}%`, top: -3, bottom: -3, width: 2,
          background: color, transform: 'translateX(-50%)',
          borderRadius: 1, boxShadow: `0 0 8px ${color}`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: C.textFaint, fontFamily: 'monospace' }}>
        <span>OVERSOLD</span><span style={{ color }}>{rsi.toFixed(1)}</span><span>OVERBOUGHT</span>
      </div>
    </div>
  )
}

// ── Fear & Greed bar ──────────────────────────────────────────────────────────
function FGBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  const color = value < 25 ? C.red : value < 45 ? '#E87820' : value < 55 ? C.amber : value < 75 ? '#88C840' : C.green
  const label = value < 25 ? 'Extreme Fear' : value < 45 ? 'Fear' : value < 55 ? 'Neutral' : value < 75 ? 'Greed' : 'Extreme Greed'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ position: 'relative', height: 5, borderRadius: 3, background: 'linear-gradient(to right,#E8394A,#E87820,#F0A500,#88C840,#00C896)' }}>
        <div style={{
          position: 'absolute', left: `${pct}%`, top: -4, width: 2, height: 13,
          background: '#FFF', transform: 'translateX(-50%)',
          borderRadius: 1, boxShadow: '0 0 6px rgba(255,255,255,0.9)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: C.textFaint, fontFamily: 'monospace' }}>
        <span>FEAR</span><span>NEUTRAL</span><span>GREED</span>
      </div>
    </div>
  )
}

// ── Signal pill ───────────────────────────────────────────────────────────────
function SigPill({ signal }: { signal?: string }) {
  const s = (signal ?? 'neutral').toLowerCase()
  const isBull = s === 'bullish' || s === 'positive'
  const isBear = s === 'bearish' || s === 'negative'
  const color = isBull ? C.green : isBear ? C.red : C.textDim
  const bg    = isBull ? `${C.green}15` : isBear ? `${C.red}15` : `${C.textDim}10`
  const icon  = isBull ? '▲' : isBear ? '▼' : '—'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color, background: bg, border: `1px solid ${color}40`,
      borderRadius: 3, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
    }}>
      {icon} {s.toUpperCase()}
    </span>
  )
}

function fmtPrice(p?: number | null) {
  if (p == null) return '—'
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  return `$${p.toFixed(2)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function TradingArena({ wallet }: { wallet: WalletData }) {
  const [asset,   setAsset]  = useState('ETH')
  const [action,  setAction] = useState<'BUY' | 'SELL'>('BUY')
  const [amount,  setAmount] = useState('')
  const [riskTol, setRisk]   = useState<RiskTol>('moderate')
  const [status,  setStatus] = useState<ArenaStatus>('idle')
  const [view,    setView]   = useState<'quick' | 'deep'>('quick')
  const [quick,   setQuick]  = useState<QuickCheckResult | null>(null)
  const [deep,    setDeep]   = useState<DeepAnalysisResult | null>(null)
  const [sid,     setSid]    = useState<string | null>(null)
  const [err,     setErr]    = useState<string | null>(null)
  const [prog,    setProg]   = useState(0)

  const pollRef          = useRef<ReturnType<typeof setInterval> | null>(null)
  const deepRunIdRef     = useRef(0)
  const deepBySessionRef = useRef<Map<string, DeepAnalysisResult>>(new Map())

  const assetInfo = ASSETS.find(a => a.symbol === asset) ?? ASSETS[0]

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  // ── Quick Check ─────────────────────────────────────────────────────────────
  async function doQuickCheck() {
    setStatus('checking'); setView('quick'); setErr(null); setQuick(null); setDeep(null); setSid(null); setProg(0)
    try {
      const result = await runQuickCheck({
        asset, action,
        amount: amount ? parseFloat(amount) : undefined,
        portfolioContext: {
          currentHoldings: {},
          availableUSD: wallet?.netWorthUsd ?? 0,
          riskTolerance: riskTol,
        },
      })
      setQuick(result)
      setSid(result.sessionId)
      setStatus('checked')
    } catch (e: any) {
      setErr(e.message ?? 'Quick check failed')
      setStatus('error')
    }
  }

  async function applyDeepResult(currentSid: string, result: DeepAnalysisResult, runId: number) {
    if (runId !== deepRunIdRef.current) return
    deepBySessionRef.current.set(currentSid, result)
    setDeep(result)
    setStatus('analyzed')
    setProg(100)
    setErr(null)
  }

  // ── Deep Analysis ────────────────────────────────────────────────────────────
  async function doDeepAnalysis() {
    if (!sid) return
    const currentSid = sid
    deepRunIdRef.current += 1
    const runId = deepRunIdRef.current
    stopPoll()

    setView('deep')
    const cached = deepBySessionRef.current.get(currentSid)
    if (cached) {
      setDeep(cached); setStatus('analyzed'); setProg(100); return
    }

    setStatus('analyzing'); setView('deep'); setDeep(null); setProg(5); setErr(null)

    const tick = async (failures: { n: number }) => {
      if (runId !== deepRunIdRef.current) return
      try {
        const statusData = await pollStatus(currentSid)
        if (runId !== deepRunIdRef.current) return
        failures.n = 0
        setProg(p => Math.min(90, Math.max(p, 5) + 7))

        if (statusData.status === 'complete') {
          stopPoll()
          const report = await getReport(currentSid)
          if (runId !== deepRunIdRef.current) return
          if (report.deepAnalysis) {
            await applyDeepResult(currentSid, report.deepAnalysis, runId)
          } else {
            setErr('Analysis complete but result data is missing — try again')
            setStatus('error')
          }
          return
        }
        if (statusData.status === 'error') {
          stopPoll()
          setErr(statusData.error ?? 'Deep analysis failed on the server')
          setStatus('error')
        }
      } catch {
        failures.n += 1
        if (failures.n >= MAX_POLL_FAILURES) {
          stopPoll()
          try {
            const report = await getReport(currentSid)
            if (runId !== deepRunIdRef.current) return
            if (report.deepAnalysis) { await applyDeepResult(currentSid, report.deepAnalysis, runId); return }
          } catch { /* fall through */ }
          setErr('Lost connection — check network and try again')
          setStatus('error')
        }
      }
    }

    try {
      const start = await startDeepAnalysis(currentSid)
      if (runId !== deepRunIdRef.current) return
      if (start.status === 'complete' && 'result' in start && start.result) {
        await applyDeepResult(currentSid, start.result, runId); return
      }
      const failures = { n: 0 }
      await tick(failures)
      pollRef.current = setInterval(() => { void tick(failures) }, POLL_INTERVAL_MS)
    } catch (e: unknown) {
      if (runId !== deepRunIdRef.current) return
      setErr(e instanceof Error ? e.message : 'Deep analysis failed')
      setStatus('error')
    }
  }

  function selectAsset(sym: string) {
    deepRunIdRef.current += 1
    stopPoll()
    setAsset(sym)
    setStatus('idle')
    setView('quick')
    setQuick(null)
    setDeep(null)
    setSid(null)
    setErr(null)
  }

  const sevColor = (s?: string) => s === 'low' ? C.green : s === 'medium' ? C.amber : s === 'high' ? C.red : C.textDim

  const isChecking  = status === 'checking'
  const isAnalyzing = status === 'analyzing'
  const hasQuick    = ['checked', 'analyzing', 'analyzed'].includes(status)
  const hasDeep     = status === 'analyzed' && deep != null

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, width: '100%', display: 'flex', flexDirection: 'column', color: C.text, fontFamily: '"SF Mono","JetBrains Mono","Fira Mono",monospace', fontSize: 12 }}>

      {/* ── Asset tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.border}`, background: C.panel, flexShrink: 0, padding: '0 16px', height: 38 }}>
        <span style={{ fontSize: 10, color: C.amber, letterSpacing: '0.18em', fontWeight: 700, marginRight: 16 }}>ØRACLE</span>
        {ASSETS.map(a => (
          <div
            key={a.symbol}
            onClick={() => selectAsset(a.symbol)}
            style={{
              padding: '0 14px', height: 38, display: 'flex', alignItems: 'center', gap: 5,
              cursor: 'pointer', fontSize: 11, fontWeight: 600, userSelect: 'none',
              borderBottom: asset === a.symbol ? `2px solid ${a.color}` : '2px solid transparent',
              color: asset === a.symbol ? C.white : C.textDim,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0, opacity: asset === a.symbol ? 1 : 0.4 }} />
            {a.symbol}
          </div>
        ))}
      </div>

      {/* ── Control bar ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, flexWrap: 'wrap' }}>
        {/* Direction */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['BUY', 'SELL'] as const).map(dir => (
            <button key={dir} onClick={() => setAction(dir)} style={{
              padding: '5px 14px', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              fontFamily: 'inherit', letterSpacing: '0.06em', transition: 'all 0.15s',
              background: action === dir ? (dir === 'BUY' ? C.green : C.red) : 'transparent',
              color: action === dir ? '#000' : C.textDim,
              border: `1px solid ${action === dir ? (dir === 'BUY' ? C.green : C.red) : C.border}`,
            }}>
              {dir === 'BUY' ? '▲' : '▼'} {dir}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 22, background: C.border }} />

        {/* Amount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>USD</span>
          <input
            type="number" min="0" placeholder="Amount (optional)"
            value={amount} onChange={e => setAmount(e.target.value)}
            style={{
              background: '#0A0A0F', border: `1px solid ${C.border}`, borderRadius: 3,
              padding: '5px 10px', color: C.text, fontSize: 11, fontFamily: 'inherit',
              outline: 'none', width: 140,
            }}
          />
        </div>

        <div style={{ width: 1, height: 22, background: C.border }} />

        {/* Risk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>RISK</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {(['low', 'moderate', 'high'] as RiskTol[]).map(r => (
              <button key={r} onClick={() => setRisk(r)} style={{
                padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 10,
                fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.15s',
                background: riskTol === r ? C.amber : 'transparent',
                color: riskTol === r ? '#000' : C.textDim,
                border: `1px solid ${riskTol === r ? C.amber : C.border}`,
              }}>{r.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={doQuickCheck}
            disabled={isChecking || isAnalyzing}
            style={{
              padding: '7px 18px', borderRadius: 3, cursor: isChecking || isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: 11, fontFamily: 'inherit', fontWeight: 700, letterSpacing: '0.06em',
              background: !isChecking && !isAnalyzing ? C.amber : 'transparent',
              color: !isChecking && !isAnalyzing ? '#000' : C.textDim,
              border: `1px solid ${!isChecking && !isAnalyzing ? C.amber : C.border}`,
              transition: 'all 0.15s',
            }}
          >
            {isChecking ? '◌ SCANNING...' : '▶ QUICK CHECK'}
          </button>
          <button
            onClick={doDeepAnalysis}
            disabled={!sid || isAnalyzing || isChecking}
            title={!sid ? 'Run Quick Check first' : 'Run 7-agent deep analysis'}
            style={{
              padding: '7px 18px', borderRadius: 3,
              cursor: sid && !isAnalyzing && !isChecking ? 'pointer' : 'not-allowed',
              fontSize: 11, fontFamily: 'inherit', fontWeight: 700, letterSpacing: '0.06em',
              background: sid && !isAnalyzing && !isChecking ? `${C.blue}20` : 'transparent',
              color: sid && !isAnalyzing && !isChecking ? C.blue : C.textFaint,
              border: `1px solid ${sid && !isAnalyzing && !isChecking ? C.blue : C.border}`,
              transition: 'all 0.15s',
            }}
          >
            {isAnalyzing ? `◌ ANALYZING ${prog}%` : '🔬 DEEP ANALYSIS'}
          </button>
        </div>
      </div>

      {/* ── View switcher tabs — shown once quick check has results ────────── */}
      {hasQuick && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.panel, flexShrink: 0 }}>
          <ViewTab
            active={view === 'quick'}
            onClick={() => setView('quick')}
            label="QUICK CHECK"
            badge={quick ? (quick.recommendation === 'EXECUTE' ? '● EXECUTE' : quick.recommendation === 'CAUTION' ? '◆ CAUTION' : '▲ AVOID') : undefined}
            badgeColor={quick ? sevColor(quick.severity) : undefined}
          />
          <ViewTab
            active={view === 'deep'}
            onClick={() => { setView('deep'); if (sid && !deep && !isAnalyzing) doDeepAnalysis() }}
            label="DEEP ANALYSIS"
            badge={isAnalyzing ? `${prog}%` : hasDeep ? '✓ DONE' : 'RUN →'}
            badgeColor={isAnalyzing ? C.blue : hasDeep ? C.green : C.textFaint}
            accent={C.blue}
          />
        </div>
      )}

      {/* ── Results canvas ───────────────────────────────────────────────────── */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── IDLE ────────────────────────────────────────────────────────────── */}
        {status === 'idle' && (
          <div style={{ minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: C.textFaint, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, opacity: 0.15 }}>⌀</div>
            <div style={{ fontSize: 13, color: C.textDim, letterSpacing: '0.1em' }}>
              Select <span style={{ color: assetInfo.color }}>{assetInfo.symbol}</span> · Set direction &amp; risk · Run Quick Check
            </div>
            <div style={{ fontSize: 10, color: C.textFaint, maxWidth: 380, lineHeight: 1.8 }}>
              Quick Check scans momentum, sentiment, whale flow and news in ~2s.
              Deep Analysis runs 7 specialized AI agents for a full trade verdict.
            </div>
          </div>
        )}

        {/* Error */}
        {err && (
          <div style={{ padding: '12px 16px', background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 4, fontSize: 11, color: C.red, lineHeight: 1.6 }}>
            ⚠ {err}
          </div>
        )}

        {/* ── QUICK VIEW ──────────────────────────────────────────────────────── */}
        {view === 'quick' && (
          <>
            {/* Scanning spinner */}
            {isChecking && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.amber, animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontSize: 13, color: C.amber, letterSpacing: '0.15em' }}>SCANNING {asset}...</div>
                <div style={{ fontSize: 10, color: C.textFaint }}>momentum · sentiment · whale flow · news</div>
              </div>
            )}

            {/* Quick check results */}
            {hasQuick && quick && (
              <Section title={`QUICK CHECK — ${asset} ${action}`} accent={C.amber}>

                {/* Recommendation banner */}
                <div style={{ padding: '18px 20px', borderRadius: 4, marginBottom: 14, background: `${sevColor(quick.severity)}08`, border: `1px solid ${sevColor(quick.severity)}35` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: sevColor(quick.severity), letterSpacing: '0.04em', marginBottom: 4 }}>
                        {quick.recommendation === 'EXECUTE' ? '● EXECUTE' : quick.recommendation === 'CAUTION' ? '◆ CAUTION' : '▲ AVOID'}
                      </div>
                      <div style={{ fontSize: 10, color: C.textDim }}>
                        SEVERITY: <span style={{ color: sevColor(quick.severity), fontWeight: 600 }}>{quick.severity?.toUpperCase()}</span>
                        <Tip text={TIP.severity} />
                        &emsp;·&emsp;{quick.executionTimeMs}ms
                      </div>
                    </div>
                    <div style={{ minWidth: 180 }}>
                      <ConfBar value={quick.confidence} label="CONFIDENCE" />
                    </div>
                  </div>
                </div>

                {/* 4-signal grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                  <SignalCard title="MOMENTUM" tip={TIP.rsi} signal={quick.signals.momentum.trend}>
                    <RSIBar rsi={quick.signals.momentum.rsi} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: 10, color: C.textDim }}>
                      <div>24H&nbsp;<span style={{ color: quick.signals.momentum.priceChange24h > 0 ? C.green : C.red }}>
                        {quick.signals.momentum.priceChange24h > 0 ? '+' : ''}{quick.signals.momentum.priceChange24h.toFixed(2)}%
                      </span></div>
                      {quick.signals.momentum.macd && (
                        <div>MACD&nbsp;<Tip text={TIP.macd} />&nbsp;<span style={{ color: (quick.signals.momentum.macd.histogram ?? 0) > 0 ? C.green : C.red }}>
                          {(quick.signals.momentum.macd.histogram ?? 0) > 0 ? '+' : ''}{(quick.signals.momentum.macd.histogram ?? 0).toFixed(3)}
                        </span></div>
                      )}
                    </div>
                  </SignalCard>

                  <SignalCard title="SENTIMENT" tip={TIP.fearGreed} signal={quick.signals.sentiment.shift}>
                    <FGBar value={quick.signals.sentiment.fearGreedIndex} />
                  </SignalCard>

                  <SignalCard title="WHALE FLOW" tip={TIP.whales}
                    signal={quick.signals.whales.direction === 'accumulation' ? 'bullish' : quick.signals.whales.direction === 'distribution' ? 'bearish' : 'neutral'}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6,
                      color: quick.signals.whales.direction === 'accumulation' ? C.green : quick.signals.whales.direction === 'distribution' ? C.red : C.textDim }}>
                      {quick.signals.whales.direction.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>
                      Vol anomaly <Tip text={TIP.volume} />:&nbsp;
                      <span style={{ color: C.text }}>{quick.signals.whales.volumeAnomaly.toFixed(2)}x avg</span>
                    </div>
                    <ConfBar value={quick.signals.whales.confidence} />
                  </SignalCard>

                  <SignalCard title="NEWS SENTIMENT" tip={TIP.news} signal={quick.signals.news.sentiment}>
                    <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>
                      {quick.signals.news.importance.toUpperCase()} IMPACT
                      {quick.signals.news.hasBreakingNews && <span style={{ color: C.red, marginLeft: 8, fontWeight: 700 }}>⚡ BREAKING</span>}
                    </div>
                    <ConfBar value={quick.signals.news.confidence} />
                    {quick.signals.news.headlines.length > 0 && (
                      <div style={{ marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                        {quick.signals.news.headlines.slice(0, 2).map((h, i) => (
                          <div key={i} style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5, marginBottom: 3 }}>
                            <span style={{ color: C.textFaint }}>›</span> {h}
                          </div>
                        ))}
                      </div>
                    )}
                  </SignalCard>
                </div>

                {/* Key Insights */}
                {quick.insights.length > 0 && (
                  <div style={{ background: C.panelB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, color: C.amber, fontWeight: 600, letterSpacing: '0.12em', marginBottom: 8 }}>KEY INSIGHTS</div>
                    {quick.insights.map((ins, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < quick.insights.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <span style={{ color: C.amber, flexShrink: 0 }}>›</span>
                        <span style={{ fontSize: 11, color: C.text, lineHeight: 1.65 }}>{ins}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA to run deep analysis */}
                {!hasDeep && !isAnalyzing && sid && (
                  <button
                    onClick={() => { setView('deep'); doDeepAnalysis() }}
                    style={{
                      marginTop: 14, width: '100%', padding: '12px', borderRadius: 4, cursor: 'pointer',
                      background: `${C.blue}15`, border: `1px dashed ${C.blue}60`,
                      color: C.blue, fontSize: 12, fontFamily: 'inherit', fontWeight: 700,
                      letterSpacing: '0.08em', transition: 'all 0.2s',
                    }}
                  >
                    🔬 Run Deep Analysis — 7 AI agents for full verdict →
                  </button>
                )}
              </Section>
            )}
          </>
        )}

        {/* ── DEEP VIEW ───────────────────────────────────────────────────────── */}
        {view === 'deep' && (
          <>
            {/* Loading */}
            {isAnalyzing && (
              <Section title="DEEP ANALYSIS — AGENTS RUNNING" accent={C.blue}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${prog}%`, height: '100%', background: `linear-gradient(90deg,${C.blue},${C.purple})`, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: 9, color: C.textDim, textAlign: 'right' }}>{prog}% — agents working in parallel</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {DEEP_AGENTS.map((agent, i) => {
                    const done    = prog > i * 13 + 12
                    const running = prog > i * 13 && !done
                    return (
                      <div key={agent.key} style={{
                        padding: '12px', background: C.panelB, borderRadius: 4,
                        border: `1px solid ${done ? `${C.green}50` : running ? `${C.blue}50` : C.border}`,
                        transition: 'border-color 0.3s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>{agent.icon}</span>
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                            background: done ? C.green : running ? C.amber : C.textFaint,
                            boxShadow: running ? `0 0 8px ${C.amber}` : done ? `0 0 6px ${C.green}` : 'none',
                          }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: done ? C.text : running ? C.textDim : C.textFaint, marginBottom: 3 }}>
                          {agent.label}
                        </div>
                        <div style={{ fontSize: 9, color: done ? C.green : running ? C.amber : C.textFaint }}>
                          {done ? '✓ complete' : running ? '◌ running...' : 'queued'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Results */}
            {hasDeep && deep && (
              <>
                {/* Final Verdict */}
                <Section title="FINAL VERDICT" accent={deep.action === 'BUY' ? C.green : deep.action === 'SELL' ? C.red : C.amber}>
                  <div style={{
                    padding: '20px 24px', borderRadius: 4, marginBottom: 14,
                    background: `${(deep.action === 'BUY' ? C.green : deep.action === 'SELL' ? C.red : C.amber)}08`,
                    border: `1px solid ${(deep.action === 'BUY' ? C.green : deep.action === 'SELL' ? C.red : C.amber)}30`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: deep.action === 'BUY' ? C.green : deep.action === 'SELL' ? C.red : C.amber, letterSpacing: '0.04em', marginBottom: 6 }}>
                          {deep.action === 'BUY' ? '▲' : deep.action === 'SELL' ? '▼' : '●'} {deep.action}
                        </div>
                        <div style={{ fontSize: 11, color: C.textDim }}>
                          {deep.conviction?.toUpperCase()} CONVICTION &emsp;·&emsp;
                          {deep.executionTimeMs ? `${(deep.executionTimeMs / 1000).toFixed(1)}s analysis time` : ''}
                        </div>
                      </div>
                      <div style={{ minWidth: 200 }}>
                        <ConfBar value={deep.confidence} label="OVERALL CONFIDENCE" />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.85, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                      {deep.reasoning}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {deep.positionSize != null && (
                      <MetricBox label="POSITION SIZE" tip={TIP.positionSize} value={`${deep.positionSize.toFixed(1)}%`} valueColor={C.amber} sub="of portfolio" />
                    )}
                    {deep.exitStrategy?.stopLoss != null && (
                      <MetricBox label="STOP LOSS" tip={TIP.stopLoss} value={fmtPrice(deep.exitStrategy.stopLoss)} valueColor={C.red} sub="exit if price hits" />
                    )}
                    {deep.exitStrategy?.targetPrice != null && (
                      <MetricBox label="TAKE PROFIT" tip={TIP.takeProfit} value={fmtPrice(deep.exitStrategy.targetPrice)} valueColor={C.green} sub="lock in gains" />
                    )}
                    {deep.risk?.riskRewardRatio != null && (
                      <MetricBox label="RISK / REWARD" tip={TIP.riskReward} value={`${deep.risk.riskRewardRatio}:1`} valueColor={C.blue} sub="reward per $ risked" />
                    )}
                    {deep.entryStrategy?.method && (
                      <MetricBox label="ENTRY METHOD" value={deep.entryStrategy.method.toUpperCase()} />
                    )}
                  </div>

                  {deep.alternatives && deep.alternatives.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: '0.1em', marginBottom: 8 }}>ALTERNATIVE STRATEGIES</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {deep.alternatives.map((alt, i) => (
                          <div key={i} style={{ padding: '8px 12px', background: C.panelB, border: `1px solid ${C.border}`, borderRadius: 4, flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 4 }}>{alt.action}</div>
                            <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.6 }}>{alt.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>

                {/* Analyst Reports */}
                {deep.analystReports && deep.analystReports.length > 0 && (
                  <Section title="ANALYST REPORTS" accent={C.blue}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {deep.analystReports.map((r, i) => (
                        <div key={i} style={{ background: C.panelB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '14px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 14 }}>{DEEP_AGENTS.find(a => a.key === r.analyst)?.icon ?? '🤖'}</span>
                              <span style={{ fontSize: 11, color: C.amber, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.analyst} Analyst</span>
                            </div>
                            <SigPill signal={r.signal} />
                          </div>
                          <ConfBar value={r.confidence} label="CONFIDENCE" />
                          <div style={{ fontSize: 11, color: C.textDim, marginTop: 10, lineHeight: 1.75 }}>{r.reasoning?.replace(/<[^>]+>/g, '').trim()}</div>
                          {r.keyFindings && r.keyFindings.length > 0 && (
                            <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                              <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: '0.1em', marginBottom: 6 }}>KEY FINDINGS</div>
                              {r.keyFindings.map((f, j) => (
                                <div key={j} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 10, color: C.text, lineHeight: 1.6 }}>
                                  <span style={{ color: C.blue, flexShrink: 0 }}>›</span>{f}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Bull vs Bear Debate */}
                {deep.debate && deep.debate.length > 0 && (
                  <Section title="BULL vs BEAR DEBATE" accent={C.purple}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {deep.debate.map((msg, i) => {
                        const isBull = msg.speaker === 'bull'
                        const isBear = msg.speaker === 'bear'
                        const isFacilitator = msg.speaker === 'facilitator'
                        const color = isBull ? C.green : isBear ? C.red : C.amber
                        return (
                          <div key={i} style={{
                            padding: '14px 16px', background: C.panelB, borderRadius: 4,
                            border: `1px solid ${color}25`,
                            marginLeft: isBull ? 0 : isBear ? 32 : 0,
                            marginRight: isBull ? 32 : isBear ? 0 : 0,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 16 }}>{isBull ? '🐂' : isBear ? '🐻' : '⚖️'}</span>
                              <span style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: '0.12em' }}>
                                {msg.speaker.toUpperCase()}
                              </span>
                              <span style={{ fontSize: 9, color: C.textFaint }}>ROUND {msg.round}</span>
                            </div>
                            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                              {isFacilitator ? msg.argument.replace(/\*\*/g, '') : msg.argument}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Section>
                )}

                {/* Risk Assessment */}
                {deep.risk && (
                  <Section title="RISK ASSESSMENT" accent={deep.risk.riskLevel === 'low' ? C.green : deep.risk.riskLevel === 'medium' ? C.amber : C.red}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 14,
                          color: deep.risk.riskLevel === 'low' ? C.green : deep.risk.riskLevel === 'medium' ? C.amber : C.red }}>
                          {deep.risk.riskLevel?.toUpperCase()} RISK
                        </div>
                        {deep.risk.suggestedPositionPct != null && (
                          <MetricRow label="Suggested Position" tip={TIP.positionSize} value={`${deep.risk.suggestedPositionPct.toFixed(1)}%`} color={C.amber} />
                        )}
                        {deep.risk.maxPositionPct != null && (
                          <MetricRow label="Max Allowed" value={`${deep.risk.maxPositionPct.toFixed(1)}%`} />
                        )}
                        {deep.risk.stopLossPrice != null && (
                          <MetricRow label="Stop Loss" tip={TIP.stopLoss} value={fmtPrice(deep.risk.stopLossPrice)} color={C.red} />
                        )}
                        {deep.risk.takeProfitPrice != null && (
                          <MetricRow label="Take Profit" tip={TIP.takeProfit} value={fmtPrice(deep.risk.takeProfitPrice)} color={C.green} />
                        )}
                        {deep.risk.riskRewardRatio != null && (
                          <MetricRow label="Risk/Reward" tip={TIP.riskReward} value={`${deep.risk.riskRewardRatio}:1`} color={C.blue} />
                        )}
                      </div>
                      <div>
                        {deep.risk.warnings && deep.risk.warnings.length > 0 ? (
                          <>
                            <div style={{ fontSize: 10, color: C.amber, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8 }}>RISK WARNINGS</div>
                            {deep.risk.warnings.map((w, i) => (
                              <div key={i} style={{ padding: '9px 12px', background: `${C.red}08`, border: `1px solid ${C.red}25`, borderRadius: 3, marginBottom: 6, fontSize: 11, color: C.red, lineHeight: 1.6 }}>
                                ⚠ {w}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div style={{ padding: '14px', background: `${C.green}08`, border: `1px solid ${C.green}25`, borderRadius: 4, fontSize: 11, color: C.green, lineHeight: 1.7 }}>
                            ✓ No significant risk warnings for this trade setup.
                          </div>
                        )}
                      </div>
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* Deep view but no results yet and not analyzing — prompt */}
            {!isAnalyzing && !hasDeep && !err && (
              <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 36, opacity: 0.15 }}>🔬</div>
                <div style={{ fontSize: 12, color: C.textDim }}>Run Quick Check first to unlock Deep Analysis</div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────────────────────

function ViewTab({ active, onClick, label, badge, badgeColor, accent }: {
  active: boolean; onClick: () => void; label: string;
  badge?: string; badgeColor?: string; accent?: string
}) {
  const col = accent ?? C.amber
  return (
    <div
      onClick={onClick}
      style={{
        padding: '0 20px', height: 38, display: 'flex', alignItems: 'center', gap: 8,
        cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s',
        borderBottom: active ? `2px solid ${col}` : '2px solid transparent',
        background: active ? `${col}08` : 'transparent',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: active ? col : C.textDim }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 9, fontWeight: 700, color: badgeColor ?? C.textDim,
          background: `${badgeColor ?? C.textDim}15`,
          border: `1px solid ${badgeColor ?? C.textDim}40`,
          borderRadius: 3, padding: '1px 6px', letterSpacing: '0.05em',
        }}>{badge}</span>
      )}
    </div>
  )
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
        background: `${accent}08`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 3, height: 14, background: accent, borderRadius: 2 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: accent }}>{title}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>{children}</div>
    </div>
  )
}

function SignalCard({ title, tip, signal, children }: { title: string; tip: string; signal?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.panelB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '0.1em' }}>
          {title}<Tip text={tip} />
        </span>
        <SigPill signal={signal} />
      </div>
      {children}
    </div>
  )
}

function MetricBox({ label, tip, value, valueColor, sub }: { label: string; tip?: string; value: string; valueColor?: string; sub?: string }) {
  return (
    <div style={{ background: C.panelB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '10px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: '0.1em', marginBottom: 6 }}>
        {label}{tip && <Tip text={tip} />}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: valueColor ?? C.text, fontFamily: 'monospace' }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: C.textFaint, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function MetricRow({ label, tip, value, color }: { label: string; tip?: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 11, color: C.textDim }}>
        {label}{tip && <Tip text={tip} />}
      </span>
      <span style={{ fontSize: 12, color: color ?? C.text, fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
    </div>
  )
}


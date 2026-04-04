import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../lib/api.js'
import { SendConfirmModal } from './SendConfirmModal.js'
import { useIsMobile } from '../lib/mobile.js'
import type { ChatMessage, WalletData, SendTxIntent } from '../types/index.js'

function cleanAssistantText(text: string): string {
  return text.replace(/\*\*/g, '').replace(/__+/g, '')
}

function renderInlineLinks(text: string) {
  const normalized = cleanAssistantText(text)
  const parts = normalized.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, idx) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a key={`${part}-${idx}`} href={part} target="_blank" rel="noreferrer" style={msgLink}>
          {part}
        </a>
      )
    }
    return <span key={`txt-${idx}`}>{part}</span>
  })
}

function renderStructuredMessage(text: string) {
  const normalized = cleanAssistantText(text)
  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  return lines.map((line, idx) => {
    const isHeader = line.endsWith(':') && !line.startsWith('•') && !line.startsWith('-')
    const isBullet = line.startsWith('•') || line.startsWith('-')
    const content = isBullet ? line.slice(1).trim() : line

    if (isHeader) {
      return (
        <div key={`h-${idx}`} style={sectionHeader}>
          {renderInlineLinks(line.slice(0, -1))}
        </div>
      )
    }
    if (isBullet) {
      return (
        <div key={`b-${idx}`} style={bulletRow}>
          <span style={bulletDot}>·</span>
          <span style={{ flex: 1 }}>{renderInlineLinks(content)}</span>
        </div>
      )
    }
    return (
      <div key={`p-${idx}`} style={paragraphRow}>
        {renderInlineLinks(line)}
      </div>
    )
  })
}

const PROMPTS = [
  'What is my net worth?',
  'Where is most of my money?',
  'Am I overexposed?',
  'What did I do recently?',
  'Analyze my risk profile',
  'Send 10 USDC to 0x...',
]

interface Props {
  wallet: WalletData
  address: string
  snapshotUpdatedAt?: string | null
  onWalletRefresh?: () => void
}

export function ChatPanel({ wallet, address, snapshotUpdatedAt, onWalletRefresh }: Props) {
  const isMobile = useIsMobile()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: buildWelcome(wallet), timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingTx, setPendingTx] = useState<SendTxIntent | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setMessages([{ id: '0', role: 'assistant', content: buildWelcome(wallet), timestamp: new Date() }])
  }, [address])

  useEffect(() => {
    if (snapshotUpdatedAt == null) return
    setMessages(prev => {
      if (prev.length !== 1) return prev
      return [{ id: '0', role: 'assistant', content: buildWelcome(wallet), timestamp: new Date() }]
    })
  }, [snapshotUpdatedAt, wallet])

  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')

    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user', content: q, timestamp: new Date(),
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    try {
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }))
      const { reply, txIntent } = await sendChat(address, apiMessages)
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString() + 'r', role: 'assistant', content: reply, timestamp: new Date() },
      ])
      if (txIntent) setPendingTx(txIntent)
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { id: 'err', role: 'assistant', content: `Error: ${err.message ?? 'Backend unreachable'}`, timestamp: new Date() },
      ])
    }
    setLoading(false)
  }

  return (
    <div style={pane}>
      {/* Page header */}
      <header style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, background: 'var(--bg)', transition: 'background 0.2s ease' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>AI Assistant</h1>
        <span style={{ fontSize: 11, color: 'var(--text-5)' }}>Wallet-aware · Context-rich</span>
      </header>

      {/* Messages */}
      <div style={{ ...msgArea, padding: isMobile ? '16px 14px 8px' : '24px 24px 8px' }}>
        {messages.map(m => (
          <div key={m.id} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 20, animation: 'fadeIn 0.2s ease',
          }}>
            <div style={m.role === 'user' ? userBubble : aiBubble}>
              {m.role === 'assistant' && (
                <span style={aiLabel}>ØRACLE</span>
              )}
              <div style={msgText}>
                {m.role === 'assistant'
                  ? renderStructuredMessage(m.content)
                  : renderInlineLinks(m.content)
                }
              </div>
            </div>
            <span style={ts}>
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0 10px 4px' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ ...dot, animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
            <span style={{ color: 'var(--c-text-6)', fontSize: 11, fontFamily: 'var(--font-data)' }}>
              analyzing chain data…
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (shown initially) */}
      {messages.length <= 1 && (
        <div style={{ ...promptsRow, padding: isMobile ? '8px 14px 4px' : '10px 24px 6px' }}>
          {PROMPTS.map(p => (
            <button key={p} style={chip} onClick={() => send(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{ ...inputRow, padding: isMobile ? '10px 12px' : '14px 20px' }}>
        <input
          style={inputStyle}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything, or 'send 0.5 ETH / 50 USDC to 0x...'"
          disabled={loading}
        />
        <button
          style={{ ...sendBtn, opacity: loading || !input.trim() ? 0.35 : 1 }}
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          ↑
        </button>
      </div>

      {/* Send confirmation modal */}
      {pendingTx && (
        <SendConfirmModal
          intent={pendingTx}
          onClose={() => setPendingTx(null)}
          onSuccess={hash => {
            setPendingTx(null)
            onWalletRefresh?.()
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString() + 'tx',
                role: 'assistant',
                content: `Transaction submitted.\nHash: ${hash}`,
                timestamp: new Date(),
              },
            ])
          }}
        />
      )}
    </div>
  )
}

function buildWelcome(w: WalletData): string {
  const topToken = w.tokens.length > 0
    ? `Top token: ${w.tokens[0].symbol} (${w.tokens[0].chain}) — $${w.tokens[0].usdValue.toLocaleString()}`
    : 'No ERC-20 tokens found.'
  const chainCount = (w.chainBreakdown ?? []).length
  return `Wallet indexed${w.ensName ? ` · ${w.ensName}` : ''}.

Net Worth:  $${w.netWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} across ${chainCount} chain${chainCount !== 1 ? 's' : ''}
Native:     ${w.ethBalance} ETH ($${w.ethBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
${topToken}
Risk Level: ${w.riskLevel} — ${w.riskReason}

Ask me anything about your wallet. To send tokens:
"send 0.1 ETH to 0x..."     — native transfer
"send 50 USDC to 0x..."     — ERC-20 transfer
"send 100 USDC to 0x... on Arbitrum" — specify chain`
}

// ── Styles ────────────────────────────────────────────────────────────────────

const pane: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: 'var(--bg)',
  transition: 'background 0.2s ease',
}

const msgArea: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '24px 24px 8px',
}

const userBubble: React.CSSProperties = {
  background: 'rgba(99,102,241,0.1)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: '12px 12px 3px 12px',
  padding: '12px 16px', maxWidth: '72%',
}

const aiBubble: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '12px 12px 12px 3px',
  padding: '14px 18px', maxWidth: '76%',
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const aiLabel: React.CSSProperties = {
  fontSize: 8, color: '#6366F1', letterSpacing: 2.5,
  display: 'block', marginBottom: 10,
  fontFamily: 'var(--font-data)', fontWeight: 600,
}

const msgText: React.CSSProperties = {
  margin: 0, fontSize: 13, lineHeight: 1.75, color: 'var(--c-text-2)',
  fontFamily: 'var(--font-data)',
}

const msgLink: React.CSSProperties = {
  color: '#a3a6ff', textDecoration: 'underline',
}

const sectionHeader: React.CSSProperties = {
  color: 'var(--c-text)', fontSize: 12, fontWeight: 600,
  letterSpacing: 0.3, marginTop: 8, marginBottom: 6,
  fontFamily: 'var(--font-data)',
}

const bulletRow: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5,
}

const bulletDot: React.CSSProperties = {
  color: '#8B5CF6', lineHeight: 1.75, fontWeight: 700, marginTop: 0,
}

const paragraphRow: React.CSSProperties = { marginBottom: 7 }

const ts: React.CSSProperties = {
  fontSize: 10, color: 'var(--c-text-7)', marginTop: 5,
  fontFamily: 'var(--font-data)',
}

const dot: React.CSSProperties = {
  width: 5, height: 5, borderRadius: '50%',
  background: '#6366F1', display: 'inline-block',
  animation: 'pulse 1.4s ease-in-out infinite',
}

const promptsRow: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 7, padding: '10px 24px 6px',
}

const chip: React.CSSProperties = {
  padding: '5px 12px',
  background: 'transparent',
  border: '1px solid #27272F',
  borderRadius: 6,
  color: '#71717A', fontSize: 11,
  fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400,
  cursor: 'pointer', transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
}

const inputRow: React.CSSProperties = {
  display: 'flex', gap: 10, padding: '12px 20px',
  borderTop: '1px solid var(--border)',
  background: 'var(--bg-subtle)',
  flexShrink: 0,
  transition: 'background 0.2s ease, border-color 0.2s ease',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-sub)',
  borderRadius: 8, padding: '10px 16px',
  color: 'var(--text)', fontSize: 14,
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'border-color 0.15s, background 0.2s ease',
}

const sendBtn: React.CSSProperties = {
  width: 40, height: 40,
  background: 'var(--accent-dim)',
  border: 'none', borderRadius: 8, color: '#fff',
  fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
  transition: 'opacity 0.15s',
}

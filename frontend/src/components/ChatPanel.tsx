import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../lib/api.js'
import { SendConfirmModal } from './SendConfirmModal.js'
import type { ChatMessage, WalletData, SendTxIntent } from '../types/index.js'

const PROMPTS = [
  'What is my net worth?',
  'Where is most of my money?',
  'Am I overexposed to anything?',
  'What did I do recently?',
  'Analyze my risk profile',
  'Send 0.01 ETH to 0x...',
]

interface Props {
  wallet: WalletData
  address: string
}

export function ChatPanel({ wallet, address }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: buildWelcome(wallet),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingTx, setPendingTx] = useState<SendTxIntent | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date(),
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

      if (txIntent) {
        setPendingTx(txIntent)
      }
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
      {/* Messages */}
      <div style={msgArea}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 18 }}>
            <div style={m.role === 'user' ? userBubble : aiBubble}>
              {m.role === 'assistant' && <span style={aiLabel}>ØRACLE</span>}
              <pre style={msgText}>{m.content}</pre>
            </div>
            <span style={ts}>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ ...dot, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <span style={{ color: '#555', fontSize: 11, fontFamily: 'monospace' }}>analyzing chain data...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (shown initially) */}
      {messages.length <= 1 && (
        <div style={promptsRow}>
          {PROMPTS.map(p => (
            <button key={p} style={chip} onClick={() => send(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={inputRow}>
        <input
          style={inputStyle}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your wallet, or say 'send 0.1 ETH to 0x...'"
          disabled={loading}
        />
        <button
          style={{ ...sendBtn, opacity: loading || !input.trim() ? 0.4 : 1 }}
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
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString() + 'tx',
                role: 'assistant',
                content: `Transaction submitted.\nHash: ${hash}\n\nView on Etherscan: https://etherscan.io/tx/${hash}`,
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
  const tokenLine = w.tokens.length > 0
    ? `Top token: ${w.tokens[0].symbol} ($${w.tokens[0].usdValue.toLocaleString()})`
    : 'No ERC-20 tokens found.'
  return `Wallet indexed${w.ensName ? ` · ${w.ensName}` : ''}.

Net Worth:  $${w.netWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
ETH:        ${w.ethBalance} ETH ($${w.ethBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
${tokenLine}
Risk Level: ${w.riskLevel} — ${w.riskReason}

Ask me anything about your wallet, or say "send X ETH to 0x..." to initiate a transfer.`
}

const pane: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
}
const msgArea: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '20px 20px 0',
}
const userBubble: React.CSSProperties = {
  background: 'rgba(99,102,241,0.15)',
  border: '1px solid rgba(99,102,241,0.25)',
  borderRadius: '8px 8px 2px 8px',
  padding: '12px 16px', maxWidth: '75%',
}
const aiBubble: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '8px 8px 8px 2px',
  padding: '14px 16px', maxWidth: '85%',
}
const aiLabel: React.CSSProperties = {
  fontSize: 9, color: '#6366F1', letterSpacing: 2,
  display: 'block', marginBottom: 8,
}
const msgText: React.CSSProperties = {
  margin: 0, fontSize: 13, lineHeight: 1.7, color: '#D0D0C8',
  whiteSpace: 'pre-wrap', fontFamily: "'IBM Plex Mono', monospace",
}
const ts: React.CSSProperties = { fontSize: 10, color: '#333', marginTop: 4 }
const dot: React.CSSProperties = {
  width: 6, height: 6, borderRadius: '50%', background: '#6366F1',
  display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite',
}
const promptsRow: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 20px',
}
const chip: React.CSSProperties = {
  padding: '6px 14px', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
  color: '#888', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
  cursor: 'pointer', transition: 'all 0.15s',
}
const inputRow: React.CSSProperties = {
  display: 'flex', gap: 10, padding: '16px 20px',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  background: 'rgba(8,10,15,0.95)',
}
const inputStyle: React.CSSProperties = {
  flex: 1, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6, padding: '12px 16px',
  color: '#E8E8E0', fontSize: 13,
  fontFamily: "'IBM Plex Mono', monospace", outline: 'none',
}
const sendBtn: React.CSSProperties = {
  width: 44, height: 44,
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  border: 'none', borderRadius: 6, color: '#fff',
  fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

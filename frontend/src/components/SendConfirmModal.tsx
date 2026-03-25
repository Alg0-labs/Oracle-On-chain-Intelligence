import { useState } from 'react'
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import type { SendTxIntent } from '../types/index.js'

interface Props {
  intent: SendTxIntent
  onClose: () => void
  onSuccess: (hash: string) => void
}

export function SendConfirmModal({ intent, onClose, onSuccess }: Props) {
  const { address } = useAppKitAccount()
  const [step, setStep] = useState<'confirm' | 'sending' | 'done' | 'error'>('confirm')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [errorMsg, setErrorMsg] = useState('')

  const { sendTransactionAsync } = useSendTransaction()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleSend = async () => {
    if (!address || !isAddress(intent.to)) return
    setStep('sending')
    try {
      const hash = await sendTransactionAsync({
        to: intent.to as `0x${string}`,
        value: parseEther(intent.amount),
      })
      setTxHash(hash)
      setStep('done')
      onSuccess(hash)
    } catch (err: any) {
      setErrorMsg(err?.shortMessage ?? err?.message ?? 'Transaction rejected')
      setStep('error')
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <span style={title}>Confirm Transaction</span>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>

        {step === 'confirm' && (
          <>
            <div style={intentBox}>
              <Row label="ACTION" value="Send ETH" />
              <Row label="TO" value={`${intent.to.slice(0, 10)}...${intent.to.slice(-8)}`} />
              <Row label="AMOUNT" value={`${intent.amount} ETH`} />
              <Row label="REASON" value={intent.reason} />
            </div>
            <p style={warning}>⚠ This will broadcast a real transaction on Ethereum mainnet.</p>
            <div style={btnRow}>
              <button style={cancelBtn} onClick={onClose}>Cancel</button>
              <button style={confirmBtn} onClick={handleSend}>Confirm &amp; Send →</button>
            </div>
          </>
        )}

        {step === 'sending' && (
          <div style={center}>
            <div style={pulse} />
            <p style={statusText}>Waiting for wallet confirmation...</p>
            {isConfirming && <p style={sub}>Transaction submitted. Confirming on-chain...</p>}
          </div>
        )}

        {step === 'done' && (
          <div style={center}>
            <div style={checkCircle}>✓</div>
            <p style={statusText}>Transaction submitted!</p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={link}
            >
              View on Etherscan →
            </a>
            <button style={confirmBtn} onClick={onClose}>Done</button>
          </div>
        )}

        {step === 'error' && (
          <div style={center}>
            <div style={errorCircle}>✕</div>
            <p style={statusText}>Transaction failed</p>
            <p style={sub}>{errorMsg}</p>
            <div style={btnRow}>
              <button style={cancelBtn} onClick={onClose}>Close</button>
              <button style={confirmBtn} onClick={() => setStep('confirm')}>Try Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--c-border-2)' }}>
      <span style={{ fontSize: 11, color: 'var(--c-text-6)', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--c-text)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'var(--c-overlay)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, backdropFilter: 'blur(8px)',
}
const modal: React.CSSProperties = {
  background: 'var(--c-modal-2)', border: '1px solid rgba(99,102,241,0.3)',
  borderRadius: 12, padding: 28, width: '100%', maxWidth: 420,
  fontFamily: "'IBM Plex Mono', monospace", boxShadow: '0 0 60px rgba(99,102,241,0.15)',
}
const header: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
}
const title: React.CSSProperties = { fontSize: 14, color: 'var(--c-text)', fontWeight: 700, letterSpacing: 1 }
const closeBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--c-text-6)', cursor: 'pointer', fontSize: 16,
}
const intentBox: React.CSSProperties = {
  background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
  borderRadius: 8, padding: '4px 16px', marginBottom: 20,
}
const warning: React.CSSProperties = { color: '#FBBF24', fontSize: 12, margin: '0 0 20px', lineHeight: 1.6 }
const btnRow: React.CSSProperties = { display: 'flex', gap: 12 }
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: '12px', background: 'var(--c-surface-4)',
  border: '1px solid var(--c-border-6)', borderRadius: 6,
  color: 'var(--c-text-5)', fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 13, cursor: 'pointer',
}
const confirmBtn: React.CSSProperties = {
  flex: 1, padding: '12px',
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  border: 'none', borderRadius: 6, color: '#fff',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 13, cursor: 'pointer', fontWeight: 700,
}
const center: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }
const pulse: React.CSSProperties = {
  width: 48, height: 48, borderRadius: '50%',
  border: '2px solid #6366F1', borderTopColor: 'transparent',
  animation: 'spin 1s linear infinite',
}
const checkCircle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: '50%',
  background: 'rgba(74,222,128,0.15)', border: '1px solid #4ADE80',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#4ADE80', fontSize: 22,
}
const errorCircle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: '50%',
  background: 'rgba(248,113,113,0.15)', border: '1px solid #F87171',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#F87171', fontSize: 22,
}
const statusText: React.CSSProperties = { color: 'var(--c-text)', fontSize: 15, fontWeight: 600, margin: 0 }
const sub: React.CSSProperties = { color: 'var(--c-text-5)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 300 }
const link: React.CSSProperties = { color: '#6366F1', fontSize: 12, textDecoration: 'none' }

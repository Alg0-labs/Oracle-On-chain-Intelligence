import { useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseEther, parseUnits, isAddress, erc20Abi } from 'viem'
import type { SendTxIntent } from '../types/index.js'

interface Props {
  intent: SendTxIntent
  onClose: () => void
  onSuccess: (hash: string) => void
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function SendConfirmModal({ intent, onClose, onSuccess }: Props) {
  const { open } = useAppKit()
  const { isConnected: wagmiConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain()

  const [step, setStep] = useState<'confirm' | 'switching' | 'sending' | 'done' | 'error'>('confirm')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [errorMsg, setErrorMsg] = useState('')

  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync }   = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash })

  const targetChainId = intent.type === 'SEND_TOKEN' ? intent.chainId : (intent.chainId ?? 1)
  const needsChainSwitch = currentChainId !== targetChainId

  // ── Wallet not connected at wagmi level ──────────────────────────────────
  if (!wagmiConnected) {
    return (
      <div style={overlay}>
        <div style={modal}>
          <ModalHeader title="Wallet Not Connected" onClose={onClose} />
          <div style={center}>
            <div style={errorCircle}>!</div>
            <p style={{ ...statusText, marginTop: 16 }}>Signer unavailable</p>
            <p style={{ ...sub, margin: '8px 0 24px' }}>
              Your wallet session has expired or the signing connector is not active.
              Reconnect to continue.
            </p>
            <div style={btnRow}>
              <button style={cancelBtn} onClick={onClose}>Cancel</button>
              <button style={confirmBtn} onClick={() => { onClose(); open() }}>
                Reconnect Wallet →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Send handler ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!isAddress(intent.to)) return
    try {
      // Switch chain if needed
      if (needsChainSwitch) {
        setStep('switching')
        await switchChainAsync({ chainId: targetChainId })
      }

      setStep('sending')

      let hash: `0x${string}`

      if (intent.type === 'SEND_TOKEN') {
        hash = await writeContractAsync({
          address:      intent.tokenAddress as `0x${string}`,
          abi:          erc20Abi,
          functionName: 'transfer',
          args:         [intent.to as `0x${string}`, parseUnits(intent.amount, intent.decimals)],
          chainId:      intent.chainId,
        })
      } else {
        hash = await sendTransactionAsync({
          to:      intent.to as `0x${string}`,
          value:   parseEther(intent.amount as `${number}`),
          chainId: intent.chainId ?? 1,
        })
      }

      setTxHash(hash)
      setStep('done')
      onSuccess(hash)
    } catch (err: any) {
      console.error('[send-confirm-modal]', err)
      setErrorMsg(err?.shortMessage ?? err?.message ?? 'Transaction rejected')
      setStep('error')
    }
  }

  // ── Explorer link ────────────────────────────────────────────────────────
  const explorerUrl = getExplorerUrl(targetChainId, txHash ?? '')

  return (
    <div style={overlay}>
      <div style={modal}>
        <ModalHeader title="Confirm Transaction" onClose={onClose} />

        {/* ── Confirm step ─────────────────────────────────────────────── */}
        {step === 'confirm' && (
          <>
            <div style={intentBox}>
              {intent.type === 'SEND_TOKEN' ? (
                <>
                  <Row label="ACTION"   value="Send Token" />
                  <Row label="TOKEN"    value={`${intent.tokenSymbol} — ${intent.tokenName}`} />
                  <Row label="AMOUNT"   value={`${intent.amount} ${intent.tokenSymbol}`} />
                  <Row label="CONTRACT" value={`${intent.tokenAddress.slice(0, 10)}…${intent.tokenAddress.slice(-8)}`} />
                </>
              ) : (
                <>
                  <Row label="ACTION" value="Send ETH" />
                  <Row label="AMOUNT" value={`${intent.amount} ETH`} />
                </>
              )}
              <Row label="TO"      value={`${intent.to.slice(0, 10)}…${intent.to.slice(-8)}`} />
              <Row label="NETWORK" value={chainName(targetChainId)} />
              {intent.reason && <Row label="REASON" value={intent.reason} />}
            </div>

            {needsChainSwitch && (
              <p style={switchWarning}>
                ⚡ Your wallet is on {chainName(currentChainId)}. It will automatically switch to {chainName(targetChainId)}.
              </p>
            )}

            <p style={warning}>⚠ This will broadcast a real transaction. Double-check all details before confirming.</p>

            <div style={btnRow}>
              <button style={cancelBtn}  onClick={onClose}>Cancel</button>
              <button
                style={{ ...confirmBtn, opacity: isSwitching ? 0.6 : 1 }}
                onClick={handleSend}
                disabled={isSwitching}
              >
                {needsChainSwitch ? `Switch & Send →` : `Confirm & Send →`}
              </button>
            </div>
          </>
        )}

        {/* ── Switching chain ───────────────────────────────────────────── */}
        {step === 'switching' && (
          <div style={center}>
            <div style={spinner} />
            <p style={statusText}>Switching to {chainName(targetChainId)}…</p>
            <p style={sub}>Approve the network switch in your wallet.</p>
          </div>
        )}

        {/* ── Sending ───────────────────────────────────────────────────── */}
        {step === 'sending' && (
          <div style={center}>
            <div style={spinner} />
            <p style={statusText}>Waiting for wallet confirmation…</p>
            {isConfirming && <p style={sub}>Transaction submitted. Confirming on-chain…</p>}
          </div>
        )}

        {/* ── Done ─────────────────────────────────────────────────────── */}
        {step === 'done' && (
          <div style={center}>
            <div style={checkCircle}>✓</div>
            <p style={statusText}>Transaction submitted!</p>
            <a href={explorerUrl} target="_blank" rel="noreferrer" style={link}>
              View on {explorerName(targetChainId)} →
            </a>
            <button style={confirmBtn} onClick={onClose}>Done</button>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {step === 'error' && (
          <div style={center}>
            <div style={errorCircle}>✕</div>
            <p style={statusText}>Transaction failed</p>
            <p style={sub}>{errorMsg}</p>
            <div style={btnRow}>
              <button style={cancelBtn}  onClick={onClose}>Close</button>
              <button style={confirmBtn} onClick={() => setStep('confirm')}>Try Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={header}>
      <span style={titleStyle}>{title}</span>
      <button style={closeBtn} onClick={onClose}>✕</button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--c-border-2)' }}>
      <span style={{ fontSize: 11, color: 'var(--c-text-6)', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--c-text)', fontFamily: 'monospace', maxWidth: 260, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

// ─── Chain helpers ────────────────────────────────────────────────────────────

const CHAINS: Record<number, { name: string; explorer: string; explorerName: string }> = {
  1:     { name: 'Ethereum',  explorer: 'https://etherscan.io',       explorerName: 'Etherscan'    },
  137:   { name: 'Polygon',   explorer: 'https://polygonscan.com',    explorerName: 'PolygonScan'  },
  56:    { name: 'BSC',       explorer: 'https://bscscan.com',        explorerName: 'BscScan'      },
  42161: { name: 'Arbitrum',  explorer: 'https://arbiscan.io',        explorerName: 'Arbiscan'     },
  10:    { name: 'Optimism',  explorer: 'https://optimistic.etherscan.io', explorerName: 'Etherscan' },
  8453:  { name: 'Base',      explorer: 'https://basescan.org',       explorerName: 'BaseScan'     },
  43114: { name: 'Avalanche', explorer: 'https://snowtrace.io',       explorerName: 'Snowtrace'    },
}

function chainName(id: number)     { return CHAINS[id]?.name         ?? `Chain ${id}` }
function explorerName(id: number)  { return CHAINS[id]?.explorerName ?? 'Explorer'    }
function getExplorerUrl(id: number, hash: string) {
  const base = CHAINS[id]?.explorer ?? 'https://etherscan.io'
  return `${base}/tx/${hash}`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'var(--c-overlay)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, backdropFilter: 'blur(8px)',
}
const modal: React.CSSProperties = {
  background: 'var(--c-modal-2)', border: '1px solid rgba(99,102,241,0.3)',
  borderRadius: 12, padding: 28, width: '100%', maxWidth: 440,
  fontFamily: "'IBM Plex Mono', monospace", boxShadow: '0 0 60px rgba(99,102,241,0.15)',
}
const header: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
}
const titleStyle: React.CSSProperties = { fontSize: 14, color: 'var(--c-text)', fontWeight: 700, letterSpacing: 1 }
const closeBtn: React.CSSProperties  = { background: 'none', border: 'none', color: 'var(--c-text-6)', cursor: 'pointer', fontSize: 16 }
const intentBox: React.CSSProperties = {
  background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
  borderRadius: 8, padding: '4px 16px', marginBottom: 16,
}
const warning: React.CSSProperties      = { color: '#FBBF24', fontSize: 12, margin: '0 0 20px', lineHeight: 1.6 }
const switchWarning: React.CSSProperties = { color: '#A78BFA', fontSize: 11, margin: '0 0 12px', lineHeight: 1.6 }
const btnRow: React.CSSProperties   = { display: 'flex', gap: 12 }
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: '12px', background: 'var(--c-surface-4)',
  border: '1px solid var(--c-border-6)', borderRadius: 6,
  color: 'var(--c-text-5)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, cursor: 'pointer',
}
const confirmBtn: React.CSSProperties = {
  flex: 1, padding: '12px',
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  border: 'none', borderRadius: 6, color: '#fff',
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, cursor: 'pointer', fontWeight: 700,
}
const center: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0',
}
const spinner: React.CSSProperties = {
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
const sub: React.CSSProperties        = { color: 'var(--c-text-5)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 300 }
const link: React.CSSProperties       = { color: '#6366F1', fontSize: 12, textDecoration: 'none' }

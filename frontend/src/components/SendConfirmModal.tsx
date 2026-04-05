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
  const network = chainName(targetChainId)

  // ── Wallet not connected ─────────────────────────────────────────────────
  if (!wagmiConnected) {
    return (
      <div style={overlay}>
        <div style={modal}>
          <ModalHeader title="Wallet Not Connected" onClose={onClose} />
          <div style={center}>
            <div style={errorCircle}>!</div>
            <p style={statusText}>Signer unavailable</p>
            <p style={sub}>Your wallet session has expired. Reconnect to continue.</p>
            <div style={btnRow}>
              <button style={cancelBtn} onClick={onClose}>Cancel</button>
              <button style={confirmBtn} onClick={() => { onClose(); open() }}>Reconnect Wallet →</button>
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
      if (needsChainSwitch) {
        setStep('switching')
        await switchChainAsync({ chainId: targetChainId })
      }
      setStep('sending')
      let hash: `0x${string}`
      if (intent.type === 'SEND_TOKEN') {
        hash = await writeContractAsync({
          address: intent.tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [intent.to as `0x${string}`, parseUnits(intent.amount, intent.decimals)],
          chainId: intent.chainId,
        })
      } else {
        hash = await sendTransactionAsync({
          to: intent.to as `0x${string}`,
          value: parseEther(intent.amount as `${number}`),
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

  const explorerUrl = getExplorerUrl(targetChainId, txHash ?? '')

  const isToken = intent.type === 'SEND_TOKEN'
  const amountLabel = isToken ? `${intent.amount} ${intent.tokenSymbol}` : `${intent.amount} ETH`
  const tokenBadge = isToken ? `ERC-20 Token · ${network}` : `Native · ${network}`

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Glow halo at top */}
        <div style={modalGlow} />

        <ModalHeader title="Confirm Transaction" onClose={onClose} />

        {/* ── Confirm ─────────────────────────────────────────────────────── */}
        {step === 'confirm' && (
          <>
            {/* From / To */}
            <div style={fromToSection}>
              <AddressRow label="FROM" value="Your Wallet" />
              <div style={arrowDivider}>
                <div style={arrowLine} />
                <span style={arrowIcon}>↓</span>
                <div style={arrowLine} />
              </div>
              <AddressRow label="TO" value={`${intent.to.slice(0, 10)}…${intent.to.slice(-8)}`} />
            </div>

            {/* Amount */}
            <div style={amountSection}>
              <div style={amountValue}>{amountLabel}</div>
              <div style={amountBadge}>{tokenBadge}</div>
            </div>

            {/* Fee / Network details */}
            <div style={detailsGrid}>
              {isToken && (
                <DetailRow label="CONTRACT">
                  <span style={monoValue}>{intent.tokenAddress.slice(0, 10)}…{intent.tokenAddress.slice(-8)}</span>
                </DetailRow>
              )}
              <DetailRow label="NETWORK">
                <span style={monoValue}>{network}</span>
              </DetailRow>
              {needsChainSwitch && (
                <DetailRow label="SWITCH">
                  <span style={{ color: '#a3a6ff', fontSize: 12, fontFamily: 'var(--font-data)' }}>
                    {chainName(currentChainId)} → {network}
                  </span>
                </DetailRow>
              )}
              {intent.reason && (
                <DetailRow label="REASON">
                  <span style={monoValue}>{intent.reason}</span>
                </DetailRow>
              )}
            </div>

            <p style={warningText}>⚠ Real transaction. Double-check all details before confirming.</p>

            <div style={btnRow}>
              <button style={cancelBtn} onClick={onClose}>Cancel</button>
              <button
                style={{ ...confirmBtn, opacity: isSwitching ? 0.6 : 1 }}
                onClick={handleSend}
                disabled={isSwitching}
              >
                {needsChainSwitch ? 'Switch & Send →' : 'Confirm & Send →'}
              </button>
            </div>

            <p style={footerNote}>
              You can send any token by simply asking ØRACLE. This transaction cannot be undone.
            </p>
          </>
        )}

        {/* ── Switching chain ──────────────────────────────────────────────── */}
        {step === 'switching' && (
          <div style={center}>
            <div style={spinner} />
            <p style={statusText}>Switching to {network}…</p>
            <p style={sub}>Approve the network switch in your wallet.</p>
          </div>
        )}

        {/* ── Sending ─────────────────────────────────────────────────────── */}
        {step === 'sending' && (
          <div style={center}>
            <div style={spinner} />
            <p style={statusText}>Waiting for wallet confirmation…</p>
            {isConfirming && <p style={sub}>Transaction submitted. Confirming on-chain…</p>}
          </div>
        )}

        {/* ── Done ────────────────────────────────────────────────────────── */}
        {step === 'done' && (
          <div style={center}>
            <div style={checkCircle}>✓</div>
            <p style={statusText}>Transaction submitted!</p>
            <a href={explorerUrl} target="_blank" rel="noreferrer" style={explorerLink}>
              View on {explorerName(targetChainId)} →
            </a>
            <button style={confirmBtn} onClick={onClose}>Done</button>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 8, color: '#6366F1', letterSpacing: 2.5, fontFamily: 'var(--font-data)', fontWeight: 600, marginBottom: 4 }}>ØRACLE</div>
        <span style={{ fontSize: 14, color: 'var(--c-text)', fontWeight: 600, letterSpacing: 0.5, fontFamily: 'var(--font-data)' }}>{title.toUpperCase()}</span>
      </div>
      <button style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-5)', borderRadius: 8, width: 30, height: 30, color: 'var(--c-text-5)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>✕</button>
    </div>
  )
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 2, fontFamily: 'var(--font-data)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--c-text-3)', fontSize: 13, fontFamily: 'var(--font-data)' }}>{value}</div>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: 9, color: 'var(--c-text-6)', letterSpacing: 2, fontFamily: 'var(--font-data)', fontWeight: 600 }}>{label}</span>
      {children}
    </div>
  )
}

// ─── Chain helpers ────────────────────────────────────────────────────────────

const CHAINS: Record<number, { name: string; explorer: string; explorerName: string }> = {
  1:     { name: 'Ethereum',  explorer: 'https://etherscan.io',            explorerName: 'Etherscan'   },
  137:   { name: 'Polygon',   explorer: 'https://polygonscan.com',         explorerName: 'PolygonScan' },
  56:    { name: 'BSC',       explorer: 'https://bscscan.com',             explorerName: 'BscScan'     },
  42161: { name: 'Arbitrum',  explorer: 'https://arbiscan.io',             explorerName: 'Arbiscan'    },
  10:    { name: 'Optimism',  explorer: 'https://optimistic.etherscan.io', explorerName: 'Etherscan'   },
  8453:  { name: 'Base',      explorer: 'https://basescan.org',            explorerName: 'BaseScan'    },
  43114: { name: 'Avalanche', explorer: 'https://snowtrace.io',            explorerName: 'Snowtrace'   },
  324:   { name: 'zkSync',    explorer: 'https://explorer.zksync.io',      explorerName: 'zkSync Explorer' },
  250:   { name: 'Fantom',    explorer: 'https://ftmscan.com',             explorerName: 'FtmScan'     },
  100:   { name: 'Gnosis',    explorer: 'https://gnosisscan.io',           explorerName: 'GnosisScan'  },
}

function chainName(id: number)    { return CHAINS[id]?.name         ?? `Chain ${id}` }
function explorerName(id: number) { return CHAINS[id]?.explorerName ?? 'Explorer'    }
function getExplorerUrl(id: number, hash: string) {
  return `${CHAINS[id]?.explorer ?? 'https://etherscan.io'}/tx/${hash}`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, backdropFilter: 'blur(12px)',
}

const modal: React.CSSProperties = {
  background: 'var(--c-modal)',
  border: '1px solid rgba(163,166,255,0.15)',
  borderRadius: 16, padding: '28px 28px 24px',
  width: '100%', maxWidth: 440,
  fontFamily: 'var(--font-data)',
  boxShadow: '0 0 80px rgba(99,102,241,0.18), 0 40px 80px rgba(0,0,0,0.4)',
  position: 'relative', overflow: 'hidden',
  animation: 'fadeIn 0.2s ease',
}

const modalGlow: React.CSSProperties = {
  position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
  width: 300, height: 80, borderRadius: '50%', pointerEvents: 'none',
  background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
}

const fromToSection: React.CSSProperties = {
  background: 'var(--c-surface)',
  borderRadius: 10, padding: '4px 16px',
  marginBottom: 16,
}

const arrowDivider: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
}

const arrowLine: React.CSSProperties = {
  flex: 1, height: 1, background: 'var(--c-border-3)',
}

const arrowIcon: React.CSSProperties = {
  color: 'var(--c-text-6)', fontSize: 14,
}

const amountSection: React.CSSProperties = {
  textAlign: 'center', padding: '18px 0 14px',
}

const amountValue: React.CSSProperties = {
  fontSize: 32, fontWeight: 600, color: 'var(--c-text)',
  fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1,
}

const amountBadge: React.CSSProperties = {
  display: 'inline-block', marginTop: 8,
  fontSize: 10, color: 'var(--c-text-5)',
  background: 'var(--c-surface-2)',
  borderRadius: 999, padding: '3px 10px',
  letterSpacing: 0.5,
}

const detailsGrid: React.CSSProperties = {
  background: 'var(--c-surface)',
  borderRadius: 10, padding: '4px 16px',
  marginBottom: 16,
}

const monoValue: React.CSSProperties = {
  color: 'var(--c-text-3)', fontSize: 12,
  fontFamily: 'var(--font-data)',
}

const warningText: React.CSSProperties = {
  color: '#FBBF24', fontSize: 11, margin: '0 0 18px', lineHeight: 1.6,
  fontFamily: 'var(--font-body)',
}

const btnRow: React.CSSProperties = { display: 'flex', gap: 10 }

const cancelBtn: React.CSSProperties = {
  flex: 1, padding: '13px',
  background: 'transparent',
  border: '1px solid var(--c-border-6)',
  borderRadius: 999,
  color: 'var(--c-text-4)',
  fontFamily: 'var(--font-data)', fontSize: 13, cursor: 'pointer', fontWeight: 500,
}

const confirmBtn: React.CSSProperties = {
  flex: 1, padding: '13px',
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  border: 'none', borderRadius: 999, color: '#fff',
  fontFamily: 'var(--font-data)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
  boxShadow: '0 0 24px rgba(99,102,241,0.35)',
}

const footerNote: React.CSSProperties = {
  color: 'var(--c-text-7)', fontSize: 10, margin: '14px 0 0',
  textAlign: 'center', lineHeight: 1.6, fontFamily: 'var(--font-body)',
}

const center: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0',
}

const spinner: React.CSSProperties = {
  width: 48, height: 48, borderRadius: '50%',
  border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366F1',
  animation: 'spin 1s linear infinite',
}

const checkCircle: React.CSSProperties = {
  width: 52, height: 52, borderRadius: '50%',
  background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#4ADE80', fontSize: 22,
}

const errorCircle: React.CSSProperties = {
  width: 52, height: 52, borderRadius: '50%',
  background: 'rgba(255,110,132,0.12)', border: '1px solid rgba(255,110,132,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#ff6e84', fontSize: 22,
}

const statusText: React.CSSProperties = {
  color: 'var(--c-text)', fontSize: 15, fontWeight: 600, margin: 0,
  fontFamily: 'var(--font-data)',
}

const sub: React.CSSProperties = {
  color: 'var(--c-text-4)', fontSize: 12, margin: 0,
  textAlign: 'center', maxWidth: 300, lineHeight: 1.6, fontFamily: 'var(--font-body)',
}

const explorerLink: React.CSSProperties = {
  color: '#a3a6ff', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-data)',
}

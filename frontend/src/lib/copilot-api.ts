import type { DeepAnalysisResult, QuickCheckResult } from '../types/index.js'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

export interface QuickCheckPayload {
  asset: string
  action: 'BUY' | 'SELL'
  amount?: number
  amountUSD?: number
  portfolioContext?: {
    currentHoldings: Record<string, number>
    availableUSD: number
    riskTolerance: 'low' | 'moderate' | 'high'
  }
}

/** Response from POST /copilot/quick-check */
export interface QuickCheckApiResponse extends QuickCheckResult {
  success?: boolean
  sessionId: string
}

export async function runQuickCheck(payload: QuickCheckPayload): Promise<QuickCheckApiResponse> {
  const res = await fetch(`${BASE}/copilot/quick-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Quick check failed (${res.status})`)
  }
  return res.json() as Promise<QuickCheckApiResponse>
}

/** Immediate response when analysis already finished (200) */
export interface DeepAnalysisStartComplete {
  success: true
  status: 'complete'
  sessionId: string
  result: DeepAnalysisResult
}

/** Async start (202) */
export interface DeepAnalysisStartAccepted {
  success: true
  status: 'analyzing'
  sessionId: string
  message?: string
}

export type DeepAnalysisStartResponse = DeepAnalysisStartComplete | DeepAnalysisStartAccepted

export async function startDeepAnalysis(sessionId: string): Promise<DeepAnalysisStartResponse> {
  const res = await fetch(`${BASE}/copilot/deep-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Deep analysis failed (${res.status})`)
  }
  return res.json() as Promise<DeepAnalysisStartResponse>
}

/** GET /copilot/status/:sessionId */
export interface CopilotStatusResponse {
  success: boolean
  sessionId: string
  status: 'quick_complete' | 'analyzing' | 'complete' | 'error' | string
  asset?: string
  action?: string
  timestamp?: number
  completedAt?: number
  error?: string
  hasQuickCheck?: boolean
  hasDeepAnalysis?: boolean
}

export async function pollStatus(sessionId: string): Promise<CopilotStatusResponse> {
  const res = await fetch(`${BASE}/copilot/status/${sessionId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Status poll failed (${res.status})`)
  }
  return res.json() as Promise<CopilotStatusResponse>
}

/** GET /copilot/report/:sessionId */
export interface CopilotReportResponse {
  success: boolean
  sessionId: string
  status: string
  trade?: { asset: string; symbol: string; action: 'BUY' | 'SELL'; amount?: number }
  quickCheck?: QuickCheckResult
  deepAnalysis?: DeepAnalysisResult | null
  timestamp?: number
  completedAt?: number
  error?: string
}

export async function getReport(sessionId: string): Promise<CopilotReportResponse> {
  const res = await fetch(`${BASE}/copilot/report/${sessionId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Failed to fetch report (${res.status})`)
  }
  return res.json() as Promise<CopilotReportResponse>
}


import { Router } from 'express'
import { z } from 'zod'
import { fetchWalletData } from '../services/wallet.service.js'
import { chat } from '../services/ai.service.js'
import dotenv from 'dotenv'
dotenv.config()

export const router = Router()

// ─── GET /api/wallet/:address ─────────────────────────────────────────────

router.get('/wallet/:address', async (req, res) => {
  const { address } = req.params

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' })
  }

  try {
    const wallet = await fetchWalletData(address)
    res.json({ success: true, wallet })
  } catch (err: any) {
    console.error('[wallet]', err.message)
    res.status(500).json({ error: err.message ?? 'Failed to fetch wallet data' })
  }
})

// ─── POST /api/chat ───────────────────────────────────────────────────────

const ChatBodySchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).min(1),
})

router.post('/chat', async (req, res) => {
  const parsed = ChatBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.errors })
  }

  const { address, messages } = parsed.data

  try {
    // Always fetch fresh wallet data for each chat request
    const wallet = await fetchWalletData(address)
    console.log(wallet)
    const response = await chat(messages, wallet)
    res.json({ success: true, ...response })
  } catch (err: any) {
    console.error('[chat]', err.message)
    res.status(500).json({ error: err.message ?? 'AI error' })
  }
})

// ─── GET /api/health ─────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

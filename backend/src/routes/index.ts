import { Router } from 'express'
import { z } from 'zod'
import { getTransactionsPaged } from '../services/wallet.service.js'
import { prisma } from '../lib/prisma.js'
import { chat } from '../services/ai.service.js'
import { fetchMarketContext } from '../services/market.service.js'
import {
  getWalletForRead,
  refreshWalletSnapshot,
  canManualRefresh,
  markManualRefresh,
} from '../services/wallet-snapshot.service.js'
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
    const { wallet, snapshotUpdatedAt, hydratedFromIndexer } = await getWalletForRead(address)
    res.json({
      success: true,
      wallet,
      snapshotUpdatedAt: snapshotUpdatedAt.toISOString(),
      hydratedFromIndexer,
    })
  } catch (err: any) {
    console.error('[wallet]', err.message)
    res.status(500).json({ error: err.message ?? 'Failed to fetch wallet data' })
  }
})

// ─── POST /api/wallet/:address/refresh ───────────────────────────────────

router.post('/wallet/:address/refresh', async (req, res) => {
  const { address } = req.params

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' })
  }

  const gate = canManualRefresh(address)
  if (!gate.ok) {
    return res.status(429).json({
      error: 'Refresh cooldown',
      retryAfterMs: gate.retryAfterMs,
    })
  }

  try {
    markManualRefresh(address)
    const wallet = await refreshWalletSnapshot(address)
    const row = await prisma.walletSnapshot.findUniqueOrThrow({
      where: { address: address.toLowerCase() },
    })
    res.json({
      success: true,
      wallet,
      snapshotUpdatedAt: row.updatedAt.toISOString(),
    })
  } catch (err: any) {
    console.error('[wallet-refresh]', err.message)
    res.status(500).json({ error: err.message ?? 'Failed to refresh wallet' })
  }
})

// ─── GET /api/wallet/:address/transactions ────────────────────────────────

router.get('/wallet/:address/transactions', async (req, res) => {
  const { address } = req.params

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' })
  }

  const offset = typeof req.query.offset === 'string' ? req.query.offset : undefined
  const limit = Math.min(parseInt(String(req.query.limit ?? '10'), 10) || 10, 50)

  try {
    const ethPriceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    const ethPriceJson = await ethPriceRes.json() as { ethereum?: { usd?: number } }
    const ethPrice = ethPriceJson?.ethereum?.usd ?? 2500

    const result = await getTransactionsPaged(address, ethPrice, offset, limit)
    res.json({ success: true, ...result })
  } catch (err: any) {
    console.error('[transactions]', err.message)
    res.status(500).json({ error: err.message ?? 'Failed to fetch transactions' })
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
    const { wallet, snapshotUpdatedAt } = await getWalletForRead(address)
    const response = await chat(messages, wallet, snapshotUpdatedAt)
    res.json({ success: true, ...response })
  } catch (err: any) {
    console.error('[chat]', err.message)
    res.status(500).json({ error: err.message ?? 'AI error' })
  }
})

// ─── GET /api/market/:address (ETH-focused context) ───────────────────────

router.get('/market/:address', async (req, res) => {
  const { address } = req.params

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' })
  }

  try {
    const { wallet } = await getWalletForRead(address)
    const market = await fetchMarketContext(wallet)
    res.json({
      success: true,
      fearGreed: market.fearGreed,
      portfolioImpact: market.portfolioImpact,
      relevantNews: market.relevantNews.slice(0, 10),
      latestNewsInsights: market.latestNewsInsights,
      fetchedAt: market.fetchedAt,
    })
  } catch (err: any) {
    console.error('[market]', err.message)
    res.status(500).json({ error: err.message ?? 'Failed to fetch market data' })
  }
})

// ─── GET /api/health ─────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

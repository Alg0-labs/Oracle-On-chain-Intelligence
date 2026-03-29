import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router } from './routes/index.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5174',
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Railway health checks, Postman etc.)
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked: ${origin}`))
      }
    },
    credentials: true,
  })
)

app.use(express.json())
app.use('/api', router)

// Railway / Vercel health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'ØRACLE backend' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔮 ØRACLE backend running on port ${PORT}`)
  console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗ missing'}`)
  console.log(`   Moralis:   ${process.env.MORALIS_API_KEY ? '✓' : '✗ missing'}`)
  console.log(`   Database:  ${process.env.DATABASE_URL ? '✓' : '✗ missing'}`)
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`)
  console.log()
})
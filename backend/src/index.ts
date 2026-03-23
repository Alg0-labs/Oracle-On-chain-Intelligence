import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router } from './routes/index.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', router)

app.listen(PORT, () => {
  console.log(`\n🔮 ØRACLE backend running on http://localhost:${PORT}`)
  console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗ missing'}`)
  console.log(`   Moralis:   ${process.env.MORALIS_API_KEY ? '✓' : '✗ missing'}`)
  console.log()
})

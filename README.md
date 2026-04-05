# ØRACLE

**On-chain intelligence, distilled.**

<img width="1027" height="308" alt="Screenshot 2026-04-06 at 12 44 30 AM" src="https://github.com/user-attachments/assets/a0568210-3833-4c1b-b80e-a6265ae5b148" />

ØRACLE is an AI intelligence layer for your crypto wallet. Connect once, ask anything in plain English, and understand everything — portfolio value, risk exposure, transaction history, and market context — from a single conversational interface.

**[Launch App](https://app.oracleprotocol.online)** · **[Landing Page](https://oracleprotocol.online)** · **[Twitter / X](https://x.com/askoracleprtcl)**

---

## What it does

- **Unified Net Worth** — Total portfolio value across ETH, ERC-20s, and DeFi positions, updated in real time.
- **AI Chat Interface** — Ask questions about your wallet in plain English. Responses are grounded in your actual on-chain data, not generic answers.
- **Risk Analysis** — Concentration scoring, stablecoin buffer analysis, and volatility exposure for your holdings.
- **Transaction Intel** — Every transaction decoded into human-readable summaries. No more raw contract addresses.
- **Market Intelligence** — Fear & Greed index, news sentiment, and macro context for your specific holdings.
- **Send ETH via Chat** — Type your intent, review the preview, confirm with your wallet. Done in 10 seconds.

Non-custodial. Read-only by default. No signup required.

---

## How sending works

<p align="center">
  <img width="492" height="692" alt="image" src="https://github.com/user-attachments/assets/78a09db0-ccf9-49db-95fd-2a3aa7e2a814" />
</p>

1. You type something like `send 0.5 ETH to vitalik.eth` in the chat
2. The AI parses your intent and returns a structured transaction preview
3. A confirmation modal appears with full details (amount, recipient, gas estimate)
4. You click **Confirm & Send** — your wallet prompts you to sign
5. Transaction hash and Etherscan link are shown on confirmation
6. The chat logs the outcome automatically

The backend never holds keys or signs transactions. All signing happens client-side through WalletConnect / Reown.

---


## Architecture

```
oracle/
├── frontend/              # App — React + Vite + TypeScript
│   └── src/
│       ├── lib/
│       │   ├── reown.ts             # WalletConnect / Reown AppKit setup
│       │   └── api.ts               # Backend API client
│       ├── components/
│       │   ├── ChatPanel.tsx         # AI chat interface
│       │   ├── PortfolioPanel.tsx    # Holdings, allocation, risk
│       │   └── SendConfirmModal.tsx  # ETH send confirmation + Wagmi tx
│       ├── types/index.ts
│       └── App.tsx
│
├── backend/               # API — Express + TypeScript + Prisma
│   └── src/
│       ├── services/
│       │   ├── wallet.service.ts    # Moralis + CoinGecko data fetching
│       │   └── ai.service.ts        # Claude AI with wallet context + tx intent
│       ├── routes/index.ts
│       └── index.ts
│
└── oracle-landing/        # Marketing site — React + Vite + Tailwind
    └── src/components/landing/
```

---

## Tech stack


| Layer             | Technology                         |
| ----------------- | ---------------------------------- |
| Frontend          | React 18 · TypeScript · Vite       |
| Wallet connection | Reown AppKit v1 (WalletConnect v3) |
| Chain interaction | Wagmi v2 · Viem                    |
| AI                | Anthropic Claude Sonnet 4          |
| Wallet data       | Moralis Deep Index API v2          |
| Price data        | CoinGecko                          |
| Backend           | Express · TypeScript · Prisma      |
| Validation        | Zod                                |


---

## Self-hosting

### Prerequisites


| Service       | URL                                                            | Notes                             |
| ------------- | -------------------------------------------------------------- | --------------------------------- |
| **Anthropic** | [https://console.anthropic.com](https://console.anthropic.com) | Claude API key                    |
| **Moralis**   | [https://moralis.io](https://moralis.io)                       | Wallet data — free tier available |
| **Etherscan** | [https://etherscan.io/apis](https://etherscan.io/apis)         | Optional, used as fallback        |
| **Reown**     | [https://cloud.reown.com](https://cloud.reown.com)             | WalletConnect project ID — free   |


### Environment variables

**Backend** (`backend/.env`)

```
ANTHROPIC_API_KEY=sk-ant-...
MORALIS_API_KEY=...
ETHERSCAN_API_KEY=...          # optional
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Frontend** (`frontend/.env`)

```
VITE_REOWN_PROJECT_ID=...
```

### Running locally

```bash
# Start all services (backend + frontend + landing page)
./dev.sh

# Or start individually
./dev.sh backend     # http://localhost:3001
./dev.sh frontend    # http://localhost:5173
./dev.sh landing     # landing page dev server
```

Or manually:

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend
cd frontend && npm install && cp .env.example .env && npm run dev
```

---

## API

### `GET /api/wallet/:address`

Returns live wallet data for any Ethereum address.

```json
{
  "success": true,
  "wallet": {
    "address": "0x...",
    "ensName": "vitalik.eth",
    "ethBalance": "1.234",
    "ethBalanceUsd": 3085.0,
    "netWorthUsd": 48320.0,
    "tokens": [],
    "transactions": [],
    "riskLevel": "MEDIUM",
    "riskReason": "ETH is 64% of portfolio..."
  }
}
```

### `POST /api/chat`

Sends a message to the AI with live wallet context. When the AI detects a transaction intent, it returns a `txIntent` object alongside the reply.

```json
// Request
{
  "address": "0x...",
  "messages": [
    { "role": "user", "content": "Send 0.1 ETH to 0xABCD..." }
  ]
}

// Response
{
  "success": true,
  "reply": "Confirmed. Preparing to send 0.1 ETH to 0xABCD...",
  "txIntent": {
    "type": "SEND_ETH",
    "to": "0xABCD...",
    "amount": "0.1",
    "reason": "User requested transfer"
  }
}
```


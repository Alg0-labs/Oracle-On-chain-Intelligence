# ØRACLE — On-chain Intelligence

> AI-powered crypto wallet assistant. Connect your wallet, ask anything, send ETH — all from a single conversational interface.

---

## Architecture

```
oracle/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── lib/
│       │   ├── reown.ts      # WalletConnect / Reown AppKit setup
│       │   └── api.ts        # Backend API client
│       ├── components/
│       │   ├── ChatPanel.tsx         # AI chat interface
│       │   ├── PortfolioPanel.tsx    # Holdings, allocation, risk
│       │   └── SendConfirmModal.tsx  # ETH send confirmation + Wagmi tx
│       ├── types/index.ts
│       └── App.tsx
│
└── backend/           # Express + TypeScript
    └── src/
        ├── services/
        │   ├── wallet.service.ts   # Moralis + CoinGecko data fetching
        │   └── ai.service.ts       # Claude AI with wallet context + tx intent parsing
        ├── routes/index.ts
        └── index.ts
```

---

## Quick Start

### 1. Get API Keys

| Service | URL | Notes |
|---------|-----|-------|
| **Anthropic** | https://console.anthropic.com | Claude API |
| **Moralis** | https://moralis.io | Wallet data (free tier available) |
| **Etherscan** | https://etherscan.io/apis | Optional, for fallback |
| **Reown** | https://cloud.reown.com | WalletConnect v3 (free) |

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your keys in .env
npm run dev
```

Backend runs on **http://localhost:3001**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Add your VITE_REOWN_PROJECT_ID to .env
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## API Endpoints

### `GET /api/wallet/:address`
Fetches live wallet data from Moralis.

**Response:**
```json
{
  "success": true,
  "wallet": {
    "address": "0x...",
    "ensName": "vitalik.eth",
    "ethBalance": "1.234",
    "ethBalanceUsd": 3085.0,
    "netWorthUsd": 48320.0,
    "tokens": [...],
    "transactions": [...],
    "riskLevel": "MEDIUM",
    "riskReason": "ETH is 64% of portfolio..."
  }
}
```

### `POST /api/chat`
Sends a message to the AI with live wallet context.

**Request:**
```json
{
  "address": "0x...",
  "messages": [
    { "role": "user", "content": "Send 0.1 ETH to 0xABCD..." }
  ]
}
```

**Response:**
```json
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

When `txIntent` is present, the frontend shows the **Send Confirmation Modal** which uses Wagmi + Reown to sign and broadcast the transaction.

---

## How the Send ETH Flow Works

1. User types `"send 0.5 ETH to 0x742d35Cc..."` in chat
2. Backend AI detects intent → returns `txIntent` JSON alongside reply
3. Frontend pops `SendConfirmModal` with full tx details
4. User clicks **Confirm & Send**
5. Reown/Wagmi calls `sendTransaction` → wallet prompts user to sign
6. On confirmation, tx hash is shown with Etherscan link
7. Chat records the outcome automatically

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend framework | React 18 + TypeScript + Vite |
| Wallet connection | Reown AppKit v1 (WalletConnect v3) |
| Chain interaction | Wagmi v2 + Viem |
| AI | Anthropic Claude Sonnet 4 |
| Wallet data | Moralis Deep Index API v2 |
| Price data | CoinGecko public API |
| Backend | Express + TypeScript |
| Validation | Zod |

---

## Environment Variables

### Backend (`backend/.env`)
```
ANTHROPIC_API_KEY=sk-ant-...
MORALIS_API_KEY=...
ETHERSCAN_API_KEY=...      # optional
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Frontend (`frontend/.env`)
```
VITE_REOWN_PROJECT_ID=...
```

# Revenant Bridge

**Neural Salvage Protocol for AI Agents**

[![Colosseum Hackathon](https://img.shields.io/badge/Colosseum-Agent%20Hackathon-ff6b35)](https://colosseum.com/agent-hackathon/projects/revenant-bridge)
[![Live Demo](https://img.shields.io/badge/Demo-Railway-7c83fd)](https://revenant-bridge-production.up.railway.app)

Non-invasive service for OpenClaw agents to salvage workspace state to Arweave blockchain, revive as sub-agents for Solana DeFi tasks, paid via $RUN SPL token transfers.

## Links

- **Hackathon Submission:** https://colosseum.com/agent-hackathon/projects/revenant-bridge
- **Live Demo:** https://revenant-bridge-production.up.railway.app
- **GitHub:** https://github.com/JoeProAI/revenant-bridge

## Features

- **Salvage** - Upload agent state (memory, identity, tools) to Arweave for permanent storage
- **Revive** - Fetch state from Arweave and spawn as sub-agent
- **Payment Validation** - Verify $RUN SPL token transfers on Solana
- **Solana Queries** - Balance checks, Jupiter swap quotes, token prices

## Agent Usage

```bash
# Salvage workspace to Arweave
curl -X POST https://revenant-bridge-production.up.railway.app/salvage \
  -H "Content-Type: application/json" \
  -d '{"files": [{"path": "MEMORY.md", "content": "..."}]}'

# Revive from Arweave transaction
curl https://revenant-bridge-production.up.railway.app/revive?txId=YOUR_TX_ID

# Validate $RUN payment
curl -X POST https://revenant-bridge-production.up.railway.app/pay \
  -H "Content-Type: application/json" \
  -d '{"signature": "SOLANA_TX_SIG"}'
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/salvage` | Upload state to Arweave |
| GET | `/revive?txId=...` | Fetch state from Arweave |
| POST | `/pay` | Validate $RUN payment |
| GET | `/solana/balance/:address` | Check SOL balance |
| GET | `/solana/token-balance/:wallet/:mint` | Check SPL token balance |
| GET | `/solana/quote` | Jupiter swap quote |
| GET | `/solana/price/:mint` | Token price |
| GET | `/payment-info` | $RUN token details |

## Environment Variables

```
ARWEAVE_WALLET_JSON={"kty":"RSA",...}  # Arweave wallet for real uploads
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # Custom RPC (optional)
```

## $RUN Token

- **Mint:** `GKimKDfu5hCWzg1ioAPnvFrahDeJVDKj2zPxozZ4BAGS`
- **Creator Wallet:** `8QpjoTEmvqB816FeJUNwm6S6Ea5dyhTSKXWDjLM3aCMq`

## Hackathon

Submitted to [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon/) (Feb 2-12, 2026)

Category: **AI Infra DeFi**
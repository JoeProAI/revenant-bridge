# Revenant Bridge

Non-invasive service for clawd.run to salvage agent state to Arweave (Neural Salvage), revive as sub-agents for Solana tasks (DeFi/trading/onchain), with payments in $RUN/USD/SOL.

## Features
- **Salvage**: Scan workspace (MEMORY.md, memory/*.md, USER.md, SOUL.md, TOOLS.md), bundle JSON, upload Arweave.
- **Revival**: Fetch txId, spawn sub-agent via sessions_spawn with revived context.
- **Payments**: USD (Stripe), SOL/$RUN (Phantom client-side).
- **UI**: Bold maximalist dashboard (https://revenant-bridge-production.up.railway.app/).

## Deploy
Railway: https://revenant-bridge-production.up.railway.app/

Env:
- ARWEAVE_WALLET_JSON: Test Arweave wallet.
- STRIPE_SECRET_KEY: Stripe test key.
- SOLANA_RPC_URL: mainnet RPC.

## Agent Usage
```
exec "curl -X POST https://revenant-bridge-production.up.railway.app/salvage-agent -d '{\"sessionKey\": \"main\"}'"
```

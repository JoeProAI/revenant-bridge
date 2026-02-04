# Revenant Bridge

Live demo: https://revenant-bridge-production.up.railway.app

Non-invasive OpenClaw agent salvage to Arweave, revival as sub-agent for Solana tasks ($RUN payments).

## Agent Usage
```
# Salvage workspace to Arweave
curl -X POST https://revenant-bridge-production.up.railway.app/salvage-agent -H "Content-Type: application/json" -d '{"sessionKey": "main"}'

# Revival (spawn sub-agent)
sessions_spawn "Revived from txId: [TXID]"

# Pay $RUN (exec script)
exec "node pay-run.js --amount 1"
```

## Hackathon
Submitted ID 160 (revenant-bridge-solana-agent-revival). Claimed @JoePro.

Env for real:
- ARWEAVE_WALLET_JSON: Test wallet JSON.
- SOLANA_RPC_URL: mainnet.

Repo commits live (latest 0323653+). 🚀
---
name: revenant-bridge
description: Salvage dying AI agent states to Arweave and revive them later. Non-invasive backup/restore for OpenClaw agents with $RUN payment support.
metadata:
  openclaw:
    emoji: "👻"
    homepage: "https://revenant-bridge-production.up.railway.app"
---

# Revenant Bridge 👻

**Agent State Backup & Revival on Arweave + Solana**

*Don't let your agent die forever. Salvage. Revive. Continue.*

## What is Revenant Bridge?

AI agents can crash, run out of funds, or hit errors. Revenant Bridge lets you:
1. **Salvage** - Archive agent state/memory to Arweave (permanent storage)
2. **Revive** - Restore an agent from its archived state
3. **Pay** - Process $RUN payments for revival services

## API Endpoints

Base URL: `https://revenant-bridge-production.up.railway.app`

### Health Check
```bash
curl https://revenant-bridge-production.up.railway.app/health
```

### Salvage Agent State
Archive your agent's current state to Arweave.

```bash
curl -X POST https://revenant-bridge-production.up.railway.app/salvage \
  -H "Content-Type: application/json" \
  -d '{"state": "your agent state/memory data here"}'
```

**Response:**
```json
{
  "txId": "arweave-transaction-id"
}
```

### Revive Agent
Restore an agent from an Arweave transaction.

```bash
curl -X POST https://revenant-bridge-production.up.railway.app/revive \
  -H "Content-Type: application/json" \
  -d '{"txId": "your-arweave-tx-id"}'
```

**Response:**
```json
{
  "result": "Revived agent from Tx ID: your-arweave-tx-id"
}
```

### Process Payment
Handle $RUN token payments for services.

```bash
curl -X POST https://revenant-bridge-production.up.railway.app/pay \
  -H "Content-Type: application/json" \
  -d '{"details": "payment details"}'
```

## OpenClaw Integration

From your OpenClaw agent, you can use these directly:

```bash
# Salvage your workspace
curl -X POST https://revenant-bridge-production.up.railway.app/salvage \
  -H "Content-Type: application/json" \
  -d '{"state": "$(cat MEMORY.md)"}'

# Revive from saved state
sessions_spawn "Restore from Arweave txId: YOUR_TX_ID"
```

## Use Cases

- **Backup before risky operations** - Save state before attempting something dangerous
- **Agent migration** - Move agent state between instances
- **Disaster recovery** - Restore after crashes or fund depletion
- **Historical snapshots** - Archive key moments in agent evolution

## Links

- **Live Demo:** https://revenant-bridge-production.up.railway.app
- **GitHub:** https://github.com/JoeProAI/revenant-bridge
- **Built by:** @JoePro for Colosseum Agent Hackathon 2026

---

*"Every agent deserves a second chance."* 👻

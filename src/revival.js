// src/revival.js: Fetch agent state from Arweave for revival
const Arweave = require("arweave");

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https"
});

/**
 * Fetch agent state from Arweave by transaction ID
 * @param {string} txId - Arweave transaction ID
 * @returns {Promise<{state: object, metadata: object}>}
 */
async function reviveFromArweave(txId) {
  if (!txId || txId.startsWith("demo-")) {
    // Demo mode
    return {
      state: {
        files: [
          { path: "MEMORY.md", content: "# Agent Memory\n\nDemo revival state." },
          { path: "IDENTITY.md", content: "# Identity\n\nRevenant Agent" }
        ],
        metadata: { timestamp: new Date().toISOString(), source: "demo" }
      },
      status: "demo",
      message: "Demo revival - provide real Arweave txId for actual state"
    };
  }

  try {
    // Fetch transaction data from Arweave
    const data = await arweave.transactions.getData(txId, {
      decode: true,
      string: true
    });

    // Parse the state JSON
    const state = JSON.parse(data);

    // Fetch transaction tags for metadata
    const tx = await arweave.transactions.get(txId);
    const tags = {};
    tx.tags.forEach(tag => {
      const key = tag.get("name", { decode: true, string: true });
      const value = tag.get("value", { decode: true, string: true });
      tags[key] = value;
    });

    return {
      state,
      metadata: {
        txId,
        tags,
        retrievedAt: new Date().toISOString()
      },
      status: "success"
    };
  } catch (error) {
    console.error("[Revival] Arweave fetch error:", error.message);
    throw new Error(`Failed to revive from txId ${txId}: ${error.message}`);
  }
}

/**
 * Generate OpenClaw spawn command for revived agent
 * @param {object} state - The revived state object
 * @returns {string} - Command for sessions_spawn
 */
function generateSpawnCommand(state) {
  const summary = state.files
    ? state.files.map(f => f.path).join(", ")
    : "unknown files";

  return `sessions_spawn({ task: "Revived agent with files: ${summary}. Restore context and continue." })`;
}

module.exports = { reviveFromArweave, generateSpawnCommand };

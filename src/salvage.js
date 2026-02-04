// src/salvage.js: Salvage agent state to Arweave
const Arweave = require("arweave");

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https"
});

/**
 * Upload agent state to Arweave
 * @param {object} stateData - The state object to salvage
 * @returns {Promise<{txId: string, status: string}>}
 */
async function salvageToArweave(stateData) {
  const walletJson = process.env.ARWEAVE_WALLET_JSON;

  if (!walletJson) {
    // Demo mode - return mock txId
    console.log("[Salvage] No ARWEAVE_WALLET_JSON, using demo mode");
    return {
      txId: `demo-${Date.now()}`,
      status: "demo",
      message: "Demo mode - set ARWEAVE_WALLET_JSON for real uploads"
    };
  }

  try {
    const wallet = JSON.parse(walletJson);
    const data = JSON.stringify(stateData);

    const tx = await arweave.createTransaction({ data }, wallet);
    tx.addTag("App-Name", "RevenantBridge");
    tx.addTag("Type", "AgentState");
    tx.addTag("Content-Type", "application/json");
    tx.addTag("Timestamp", new Date().toISOString());

    await arweave.transactions.sign(tx, wallet);
    const response = await arweave.transactions.post(tx);

    if (response.status === 200 || response.status === 202) {
      return {
        txId: tx.id,
        status: "submitted",
        message: "Transaction submitted to Arweave network"
      };
    } else {
      throw new Error(`Arweave upload failed: ${response.status}`);
    }
  } catch (error) {
    console.error("[Salvage] Arweave error:", error.message);
    throw error;
  }
}

/**
 * Build salvage payload from agent files
 * @param {Array<{path: string, content: string}>} files
 * @param {object} metadata
 * @returns {object}
 */
function buildSalvagePayload(files, metadata = {}) {
  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    files,
    metadata: {
      source: "RevenantBridge",
      ...metadata
    }
  };
}

module.exports = { salvageToArweave, buildSalvagePayload };

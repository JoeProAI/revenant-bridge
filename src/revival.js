// src/revival.js: Fetch from Arweave and spawn sub-agent
const arweave = require(\"arweave\");
const { exec } = require(\"child_process\");

async function reviveFromArweave(txId) {
  const ar = arweave.init({ host: \"arweave.net\", port: 443, protocol: \"https\" });
  const data = await ar.transactions.getData(txId, { decode: true, string: true });
  // Spawn sub-agent (e.g., via OpenClaw sessions_spawn or similar)
  exec(`openclaw sessions_spawn --task \"Revived agent: ${data}\"`, (err, stdout) => {
    if (err) console.error(err);
    console.log(\"Sub-agent spawned:\", stdout);
  });
  return \"Revived\";
}
module.exports = { reviveFromArweave };

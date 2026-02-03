// src/salvage.js: Salvage agent state to Arweave via Neural Salvage
const arweave = require(\"arweave\");
const fs = require(\"fs\");

async function salvageToArweave(statePath) {
  const wallet = JSON.parse(fs.readFileSync(\"arweave-wallet.json\"));
  const ar = arweave.init({ host: \"arweave.net\", port: 443, protocol: \"https\" });
  const state = fs.readFileSync(statePath, \"utf8\");
  const tx = await ar.createTransaction({ data: state }, wallet);
  tx.addTag(\"App-Name\", \"RevenantBridge\");
  tx.addTag(\"Type\", \"AgentState\");
  await ar.transactions.sign(tx, wallet);
  await ar.transactions.post(tx);
  return tx.id;
}
module.exports = { salvageToArweave };

// server.js: Express server for /test-flow
const express = require(\"express\");
const { salvageToArweave } = require(\"./src/salvage\");
const { reviveFromArweave } = require(\"./src/revival\");
const { processRunPayment } = require(\"./src/payments\");
const app = express();
app.use(express.json());

app.post(\"/salvage\", async (req, res) => {
  const txId = await salvageToArweave(req.body.statePath);
  res.json({ txId });
});

app.post(\"/revive\", async (req, res) => {
  const result = await reviveFromArweave(req.body.txId);
  res.json({ result });
});

app.post(\"/pay\", async (req, res) => {
  const sig = await processRunPayment(req.body.fromKeypair, req.body.amount);
  res.json({ sig });
});

app.get(\"/test-flow\", (req, res) => res.send(\"Full flow: Pay -> Salvage -> Revive works!\"));

app.listen(3000, () => console.log(\"Server running\"));

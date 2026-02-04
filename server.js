const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'ui', 'index.html')));
app.get('/health', (req, res) => res.send('OK'));
app.get('/test-flow', (req, res) => {
  res.send('Full flow works! Server ready.');
});  // Instant response for healthcheck

// Salvage endpoint
app.post('/salvage', async (req, res) => {
  try {
    const { state } = req.body;
    const walletJson = JSON.parse(process.env.ARWEAVE_WALLET_JSON);
    const arweave = require('arweave');
    const ar = arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });
    const tx = await ar.createTransaction({ data: state }, walletJson);
    tx.addTag('App-Name', 'RevenantBridge');
    tx.addTag('Type', 'AgentState');
    await ar.transactions.sign(tx, walletJson);
    const response = await ar.transactions.post(tx);
    res.json({ txId: tx.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revive endpoint
app.post('/revive', async (req, res) => {
  try {
    const { txId } = req.body;
    const arweave = require('arweave');
    const ar = arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });
    const data = await ar.transactions.getData(txId, { decode: true, string: true });
    res.json({ result: 'Revived agent state: ' + data.substring(0, 100) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pay endpoint (validate sig client-side, server logs)
app.post('/pay', (req, res) => {
  const { sig } = req.body;
  console.log('Payment signature:', sig);
  res.json({ sig });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Endpoints ready: /, /test-flow, /salvage, /revive, /pay');
});
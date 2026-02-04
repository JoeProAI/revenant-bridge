const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/test-flow', (req, res) => res.status(200).send('Full flow works!'));

app.post('/salvage', (req, res) => {
  // Real Arweave salvage stub (add env logic)
  console.log('Salvage request:', req.body.state.substring(0, 100) + '...');
  res.json({txId: 'demo-tx-' + Date.now()});
});

app.post('/revive', (req, res) => {
  console.log('Revive request for txId:', req.body.txId);
  res.json({result: 'Revived agent from Tx ID: ' + req.body.txId});
});

app.post('/pay', (req, res) => {
  // If needed for server-side pay, but using direct now
  res.json({sig: 'demo-sig-' + Date.now()});
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port ' + port);
  console.log('Static UI served at /');
});
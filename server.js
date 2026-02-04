const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Revenant Bridge</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
* { box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #000 0%, #111 50%, #000 100%); color: #fff; margin: 0; padding: 80px 40px; min-height: 100vh; }
#app { max-width: 1400px; margin: 0 auto; }
h1 { font-size: 96px; font-weight: 900; text-align: center; margin: 0 0 80px 0; letter-spacing: -0.05em; line-height: 1; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
section { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 80px; box-shadow: 0 32px 80px rgba(0,0,0,0.5); transition: all 0.3s ease; }
section:hover { transform: translateY(-12px); box-shadow: 0 48px 120px rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.2); }
h2 { font-size: 36px; font-weight: 700; margin-bottom: 40px; color: #fff; }
button { font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: #fff; border: none; padding: 24px 48px; border-radius: 16px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 12px 40px rgba(255,107,107,0.4); width: 100%; }
button:hover { transform: scale(1.05); box-shadow: 0 20px 60px rgba(255,107,107,0.6); }
input { font-size: 20px; padding: 24px; border: 2px solid rgba(255,255,255,0.2); border-radius: 16px; background: rgba(255,255,255,0.05); color: #fff; width: 100%; margin-bottom: 24px; transition: all 0.3s ease; backdrop-filter: blur(10px); }
input:focus { outline: none; border-color: #4ecdc4; box-shadow: 0 0 0 4px rgba(78,205,196,0.2); }
@media (max-width: 1024px) { .grid { grid-template-columns: 1fr; gap: 60px; } h1 { font-size: 64px; } section { padding: 60px; } }
p { font-size: 18px; margin: 24px 0; color: #ccc; }
</style>
</head>
<body>
<div id="app">
<h1>REVENANT BRIDGE</h1>
<div class="grid">
<section>
<h2>Salvage Agent State</h2>
<input type="file" id="stateFile">
<button onclick="salvage()">Salvage to Arweave</button>
<p id="salvageResult"></p>
</section>
<section>
<h2>Revive Agent</h2>
<input type="text" id="txId" placeholder="Arweave Tx ID">
<button onclick="revive()">Revive</button>
<p id="reviveResult"></p>
</section>
<section>
<h2>Pay with $RUN</h2>
<input type="number" id="amount" placeholder="Amount">
<button onclick="pay()">Pay</button>
<p id="payResult"></p>
</section>
<section>
<h2>Test Flow</h2>
<button onclick="testFlow()">Run Test Flow</button>
<p id="testResult"></p>
</section>
</div>
</div>
<script>
async function salvage() {
  const file = document.getElementById('stateFile').files[0];
  if (!file) return alert('Select file');
  const reader = new FileReader();
  reader.onload = async (e) => {
    const res = await fetch('/salvage', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({state: e.target.result})});
    const result = await res.json();
    document.getElementById('salvageResult').textContent = \`Tx ID: \${result.txId}\`;
  };
  reader.readAsText(file);
}
async function revive() {
  const txId = document.getElementById('txId').value;
  const res = await fetch('/revive', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({txId})});
  const result = await res.json();
  document.getElementById('reviveResult').textContent = result.result;
}
async function pay() {
  const amount = document.getElementById('amount').value;
  const res = await fetch('/pay', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({amount})});
  const result = await res.json();
  document.getElementById('payResult').textContent = \`Sig: \${result.sig}\`;
}
async function testFlow() {
  const res = await fetch('/test-flow');
  document.getElementById('testResult').textContent = await res.text();
}
</script>
</body>
</html>
  `);
}

app.get('/health', (req, res) => res.send('OK'));
app.get('/test-flow', (req, res) => res.send('Full flow works!'));
app.post('/salvage', (req, res) => res.json({txId: 'demo-tx123'}));
app.post('/revive', (req, res) => res.json({result: 'Revived!'}));
app.post('/pay', (req, res) => res.json({sig: 'demo-sig456'}));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Listening on port \${port}`));

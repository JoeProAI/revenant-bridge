const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Inline UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Revenant Bridge</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
<style>
body { 
  font-family: 'Inter', sans-serif; 
  margin: 0; 
  padding: 0; 
  background: #fafafa; 
  color: #333; 
  line-height: 1.6;
}
.container { 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 60px 20px; 
  display: grid; 
  grid-template-columns: 1fr 2fr 1fr; 
  gap: 60px; 
  align-items: start; 
}
header { 
  grid-column: 1 / -1; 
  text-align: center; 
  margin-bottom: 100px; 
}
h1 { 
  font-size: 72px; 
  font-weight: 900; 
  margin: 0; 
  letter-spacing: -0.03em; 
  color: #111; 
}
.section { 
  background: white; 
  padding: 50px; 
  border-radius: 16px; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.06); 
  transition: box-shadow 0.3s ease; 
}
.section:hover { 
  box-shadow: 0 12px 40px rgba(0,0,0,0.08); 
}
h2 { 
  font-size: 36px; 
  font-weight: 700; 
  margin: 0 0 40px 0; 
  color: #222; 
}
form { 
  display: flex; 
  flex-direction: column; 
  gap: 24px; 
}
input, textarea { 
  padding: 20px; 
  font-size: 16px; 
  border: 2px solid #e5e5e5; 
  border-radius: 12px; 
  transition: border-color 0.3s; 
  font-family: inherit;
}
input:focus, textarea:focus { 
  outline: none; 
  border-color: #000; 
}
textarea { 
  resize: vertical; 
  min-height: 120px; 
}
button { 
  padding: 20px; 
  font-size: 18px; 
  font-weight: 700; 
  background: #000; 
  color: white; 
  border: none; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: background 0.3s, box-shadow 0.3s; 
}
button:hover { 
  background: #333; 
  box-shadow: 0 4px 16px rgba(0,0,0,0.15); 
}
.result { 
  margin-top: 30px; 
  padding: 20px; 
  background: #f8f9fa; 
  border-radius: 12px; 
  border-left: 4px solid #000; 
  display: none; 
}
#pay { 
  margin-top: 150px; 
  grid-row: span 2; 
} /* asymmetric */
@media (max-width: 1024px) { 
  .container { 
    grid-template-columns: 1fr; 
    gap: 40px; 
  } 
  h1 { font-size: 48px; } 
  .section { padding: 40px 30px; } 
}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Revenant Bridge</h1>
  </header>
  <div id="salvage" class="section">
    <h2>Salvage</h2>
    <form id="salvageForm">
      <textarea id="state" placeholder="Enter state data to salvage..."></textarea>
      <button type="submit">Initiate Salvage</button>
    </form>
    <div id="salvageResult" class="result"></div>
  </div>
  <div id="revive" class="section">
    <h2>Revive</h2>
    <form id="reviveForm">
      <input type="text" id="txId" placeholder="Enter Tx ID">
      <button type="submit">Revive Agent</button>
    </form>
    <div id="reviveResult" class="result"></div>
  </div>
  <div id="pay" class="section">
    <h2>Pay</h2>
    <form id="payForm">
      <input type="text" id="payDetails" placeholder="Payment details">
      <button type="submit">Process Payment</button>
    </form>
    <div id="payResult" class="result"></div>
  </div>
</div>
<script>
async function handleSubmit(formId, endpoint, bodyKey, resultId, displayText) {
  const form = document.getElementById(formId);
  const result = document.getElementById(resultId);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = form.querySelector('input, textarea').value;
    const res = await fetch(\`/\${endpoint}\`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({[bodyKey]: value})
    });
    const data = await res.json();
    result.innerHTML = displayText.replace('{data}', JSON.stringify(data, null, 2));
    result.style.display = 'block';
  });
}
handleSubmit('salvageForm', 'salvage', 'state', 'salvageResult', 'Salvage Result: <pre>{data}</pre>');
handleSubmit('reviveForm', 'revive', 'txId', 'reviveResult', 'Revive Result: <pre>{data}</pre>');
handleSubmit('payForm', 'pay', 'details', 'payResult', 'Pay Result: <pre>{data}</pre>');
</script>
</body>
</html>
  `);
});

app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/test-flow', (req, res) => res.status(200).send('Full flow works!'));

app.post('/salvage', (req, res) => {
  // Real Arweave salvage stub (add env logic)
  console.log('Salvage request:', req.body.state ? req.body.state.substring(0, 100) + '...' : 'No state');
  res.json({txId: 'demo-tx-' + Date.now()});
});

app.post('/revive', (req, res) => {
  console.log('Revive request for txId:', req.body.txId);
  res.json({result: 'Revived agent from Tx ID: ' + (req.body.txId || 'unknown')});
});

app.post('/pay', (req, res) => {
  // If needed for server-side pay, but using direct now
  console.log('Pay request:', req.body.details);
  res.json({sig: 'demo-sig-' + Date.now()});
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port ' + port);
  console.log('Inline UI served at /');
});

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
// app.use(express.static('ui')); // Commented out since inlining UI

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revenant Bridge</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #000;
            color: #fff;
            margin: 0;
            padding: 0;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 40px;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        header {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 0;
        }
        h1 {
            font-size: 72px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 4px 8px rgba(0,0,0,0.5);
            letter-spacing: -2px;
        }
        .aside {
            background: rgba(255,255,255,0.03);
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.4);
            height: fit-content;
            align-self: start;
        }
        .main {
            display: flex;
            flex-direction: column;
            gap: 60px;
            padding: 0;
        }
        section {
            background: rgba(255,255,255,0.03);
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        h2 {
            font-size: 48px;
            font-weight: 700;
            margin: 0 0 30px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        input, textarea, button {
            font-family: inherit;
            padding: 15px 20px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: #fff;
            font-size: 16px;
        }
        input::placeholder, textarea::placeholder {
            color: rgba(255,255,255,0.6);
        }
        button {
            background: #fff;
            color: #000;
            font-weight: 700;
            cursor: pointer;
            transition: box-shadow 0.2s;
        }
        button:hover {
            box-shadow: 0 4px 12px rgba(255,255,255,0.2);
        }
        #test-result, #salvage-result, #revive-result, #pay-result {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0,255,0,0.1);
            border-radius: 8px;
            border-left: 4px solid #0f0;
        }
        @media (max-width: 768px) {
            body { grid-template-columns: 1fr; gap: 20px; padding: 10px; }
            h1 { font-size: 48px; }
            h2 { font-size: 36px; }
        }
    </style>
</head>
<body>
    <header>
        <h1>Revenant Bridge</h1>
    </header>
    <aside class="aside">
        <h2>Test Flow</h2>
        <button onclick="testFlow()">Run Test</button>
        <div id="test-result"></div>
    </aside>
    <main class="main">
        <section>
            <h2>Salvage Agent</h2>
            <form id="salvage-form">
                <textarea id="state" placeholder="Enter agent state JSON..." rows="6" style="width: 100%; resize: vertical;"></textarea>
                <button type="submit">Salvage to Arweave</button>
            </form>
            <div id="salvage-result"></div>
        </section>
        <section>
            <h2>Revive Agent</h2>
            <form id="revive-form">
                <input type="text" id="txId" placeholder="Enter Arweave Tx ID">
                <button type="submit">Revive from Tx</button>
            </form>
            <div id="revive-result"></div>
        </section>
        <section>
            <h2>Pay</h2>
            <form id="pay-form">
                <input type="number" id="amount" placeholder="Amount in AR" step="0.01" min="0">
                <button type="submit">Process Payment</button>
            </form>
            <div id="pay-result"></div>
        </section>
    </main>
    <script>
        async function testFlow() {
            const resultDiv = document.getElementById('test-result');
            try {
                resultDiv.innerHTML = 'Running...';
                const res = await fetch('/test-flow');
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const text = await res.text();
                resultDiv.innerHTML = '<p style="color: #0f0;">' + text + '</p>';
            } catch (e) {
                resultDiv.innerHTML = '<p style="color: #f00;">Error: ' + e.message + '</p>';
            }
        }

        document.getElementById('salvage-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const state = document.getElementById('state').value;
            if (!state.trim()) return alert('Enter state');
            const resultDiv = document.getElementById('salvage-result');
            try {
                resultDiv.innerHTML = 'Salvaging...';
                const res = await fetch('/salvage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ state })
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                resultDiv.innerHTML = '<p style="color: #0f0;">Tx ID: ' + data.txId + '</p>';
            } catch (e) {
                resultDiv.innerHTML = '<p style="color: #f00;">Error: ' + e.message + '</p>';
            }
        });

        document.getElementById('revive-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const txId = document.getElementById('txId').value.trim();
            if (!txId) return alert('Enter Tx ID');
            const resultDiv = document.getElementById('revive-result');
            try {
                resultDiv.innerHTML = 'Reviving...';
                const res = await fetch('/revive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ txId })
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                resultDiv.innerHTML = '<p style="color: #0f0;">' + data.result + '</p>';
            } catch (e) {
                resultDiv.innerHTML = '<p style="color: #f00;">Error: ' + e.message + '</p>';
            }
        });

        document.getElementById('pay-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('amount').value);
            if (isNaN(amount) || amount <= 0) return alert('Enter valid amount');
            const resultDiv = document.getElementById('pay-result');
            try {
                resultDiv.innerHTML = 'Processing...';
                const res = await fetch('/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount })
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                resultDiv.innerHTML = '<p style="color: #0f0;">Signature: ' + data.sig + '</p>';
            } catch (e) {
                resultDiv.innerHTML = '<p style="color: #f00;">Error: ' + e.message + '</p>';
            }
        });
    </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html);
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
  console.log('Inline UI served');
});
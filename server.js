const express = require('express');
const path = require('path');

// Import modules
const { salvageToArweave, buildSalvagePayload } = require('./src/salvage');
const { reviveFromArweave, generateSpawnCommand } = require('./src/revival');
const { validateRunPayment, getPaymentInfo } = require('./src/payments');
const { checkBalance, checkTokenBalance, getJupiterQuote, getTokenPrice } = require('./src/solana-tasks');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Serve static UI
app.use('/ui', express.static(path.join(__dirname, 'ui')));

// ============================================================
// HEALTH & INFO
// ============================================================

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/test-flow', (req, res) => res.json({
  status: 'operational',
  endpoints: ['/salvage', '/revive', '/pay', '/validate-payment', '/solana/*'],
  arweave: process.env.ARWEAVE_WALLET_JSON ? 'configured' : 'demo-mode',
  solana: process.env.SOLANA_RPC_URL || 'mainnet-beta'
}));

app.get('/payment-info', (req, res) => {
  res.json(getPaymentInfo());
});

// ============================================================
// SALVAGE - Upload agent state to Arweave
// ============================================================

app.post('/salvage', async (req, res) => {
  try {
    const { state, files, metadata } = req.body;

    let payload;
    if (files && Array.isArray(files)) {
      // Structured payload with files array
      payload = buildSalvagePayload(files, metadata);
    } else if (state) {
      // Raw state string - wrap it
      payload = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        rawState: state,
        metadata: metadata || {}
      };
    } else {
      return res.status(400).json({ error: 'Missing state or files in request body' });
    }

    console.log('[Salvage] Processing:', JSON.stringify(payload).substring(0, 200) + '...');
    const result = await salvageToArweave(payload);

    res.json(result);
  } catch (error) {
    console.error('[Salvage] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Agent-specific salvage endpoint
app.post('/salvage-agent', async (req, res) => {
  try {
    const { sessionKey, files } = req.body;

    // Default agent files to salvage
    const defaultFiles = [
      'MEMORY.md', 'memory/*.md', 'USER.md', 'SOUL.md', 'TOOLS.md', 'IDENTITY.md'
    ];

    const payload = buildSalvagePayload(
      files || defaultFiles.map(f => ({ path: f, content: `[Placeholder for ${f}]` })),
      { sessionKey: sessionKey || 'default', source: 'agent-salvage' }
    );

    const result = await salvageToArweave(payload);
    res.json(result);
  } catch (error) {
    console.error('[Salvage-Agent] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// REVIVE - Fetch state from Arweave
// ============================================================

app.post('/revive', async (req, res) => {
  try {
    const { txId } = req.body;
    if (!txId) {
      return res.status(400).json({ error: 'Missing txId in request body' });
    }

    console.log('[Revive] Fetching:', txId);
    const result = await reviveFromArweave(txId);

    // Add spawn command suggestion
    if (result.state) {
      result.spawnCommand = generateSpawnCommand(result.state);
    }

    res.json(result);
  } catch (error) {
    console.error('[Revive] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint for convenience
app.get('/revive', async (req, res) => {
  try {
    const txId = req.query.txId;
    if (!txId) {
      return res.status(400).json({ error: 'Missing txId query parameter' });
    }

    const result = await reviveFromArweave(txId);
    if (result.state) {
      result.spawnCommand = generateSpawnCommand(result.state);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PAYMENTS - $RUN token validation
// ============================================================

app.post('/pay', async (req, res) => {
  try {
    const { signature, expectedAmount } = req.body;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature in request body' });
    }

    console.log('[Pay] Validating:', signature);
    const result = await validateRunPayment(signature, expectedAmount || 0);

    res.json(result);
  } catch (error) {
    console.error('[Pay] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/validate-payment', async (req, res) => {
  try {
    const { signature, expectedAmount } = req.body;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const result = await validateRunPayment(signature, expectedAmount || 0);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SOLANA TASKS - DeFi queries for agents
// ============================================================

app.get('/solana/balance/:address', async (req, res) => {
  try {
    const result = await checkBalance(req.params.address);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/solana/token-balance/:wallet/:mint', async (req, res) => {
  try {
    const result = await checkTokenBalance(req.params.wallet, req.params.mint);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/solana/quote', async (req, res) => {
  try {
    const { inputMint, outputMint, amount } = req.query;
    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({ error: 'Missing inputMint, outputMint, or amount' });
    }
    const result = await getJupiterQuote(inputMint, outputMint, parseInt(amount));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/solana/price/:mint', async (req, res) => {
  try {
    const result = await getTokenPrice(req.params.mint);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// UI - Serve main interface
// ============================================================

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revenant Bridge</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --border: #2a2a3a;
      --text: #e4e4e7;
      --muted: #71717a;
      --accent: #00f5d4;
      --accent-dim: #00c4aa;
      --warning: #fbbf24;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 24px;
    }
    header {
      text-align: center;
      margin-bottom: 60px;
    }
    h1 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 48px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent) 0%, var(--warning) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    .subtitle {
      color: var(--muted);
      font-size: 18px;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      margin-top: 20px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      border-color: var(--accent);
      box-shadow: 0 0 30px rgba(0, 245, 212, 0.1);
    }
    .card h2 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 8px;
    }
    .card p {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 24px;
    }
    form { display: flex; flex-direction: column; gap: 16px; }
    input, textarea {
      width: 100%;
      padding: 14px 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    textarea { min-height: 100px; resize: vertical; }
    button {
      padding: 14px 24px;
      background: var(--accent);
      color: var(--bg);
      border: none;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
    }
    button:hover { background: var(--accent-dim); transform: translateY(-2px); }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .result {
      margin-top: 20px;
      padding: 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      display: none;
      word-break: break-all;
    }
    .result.show { display: block; }
    .result.success { border-color: var(--accent); }
    .result.error { border-color: var(--danger); }
    pre { white-space: pre-wrap; }
    .api-docs {
      margin-top: 60px;
      padding: 32px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
    }
    .api-docs h2 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      margin-bottom: 20px;
      color: var(--warning);
    }
    .endpoint {
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }
    .endpoint:last-child { border-bottom: none; }
    .method { color: var(--accent); font-weight: 600; }
    .path { color: var(--text); }
    .desc { color: var(--muted); font-size: 12px; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Revenant Bridge</h1>
      <p class="subtitle">Non-invasive agent salvage to Arweave, revival for Solana tasks</p>
      <div class="status">
        <span class="status-dot"></span>
        <span id="statusText">Checking...</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>SALVAGE</h2>
        <p>Upload agent state to Arweave for permanent storage</p>
        <form id="salvageForm">
          <textarea id="stateInput" placeholder='{"files": [{"path": "MEMORY.md", "content": "..."}]}'></textarea>
          <button type="submit">Salvage to Arweave</button>
        </form>
        <div id="salvageResult" class="result"></div>
      </div>

      <div class="card">
        <h2>REVIVE</h2>
        <p>Fetch agent state from Arweave by transaction ID</p>
        <form id="reviveForm">
          <input type="text" id="txIdInput" placeholder="Arweave Transaction ID">
          <button type="submit">Revive Agent</button>
        </form>
        <div id="reviveResult" class="result"></div>
      </div>

      <div class="card">
        <h2>VALIDATE PAYMENT</h2>
        <p>Verify $RUN SPL token transfer to creator wallet</p>
        <form id="payForm">
          <input type="text" id="sigInput" placeholder="Solana Transaction Signature">
          <button type="submit">Validate Payment</button>
        </form>
        <div id="payResult" class="result"></div>
      </div>

      <div class="card">
        <h2>SOLANA QUERY</h2>
        <p>Check balances and get swap quotes</p>
        <form id="solanaForm">
          <input type="text" id="addressInput" placeholder="Wallet Address">
          <button type="submit">Check SOL Balance</button>
        </form>
        <div id="solanaResult" class="result"></div>
      </div>
    </div>

    <div class="api-docs">
      <h2>API ENDPOINTS</h2>
      <div class="endpoint">
        <span class="method">POST</span> <span class="path">/salvage</span>
        <div class="desc">Upload state to Arweave. Body: { state: string } or { files: [{path, content}] }</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/revive?txId=...</span>
        <div class="desc">Fetch state from Arweave by transaction ID</div>
      </div>
      <div class="endpoint">
        <span class="method">POST</span> <span class="path">/pay</span>
        <div class="desc">Validate $RUN payment. Body: { signature: string }</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/solana/balance/:address</span>
        <div class="desc">Check SOL balance for wallet address</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/solana/token-balance/:wallet/:mint</span>
        <div class="desc">Check SPL token balance</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/solana/quote?inputMint=...&outputMint=...&amount=...</span>
        <div class="desc">Get Jupiter swap quote</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/payment-info</span>
        <div class="desc">Get $RUN token mint and destination wallet</div>
      </div>
    </div>
  </div>

  <script>
    // Check status
    fetch('/test-flow').then(r => r.json()).then(d => {
      document.getElementById('statusText').textContent =
        d.arweave === 'configured' ? 'Live (Arweave configured)' : 'Demo Mode';
    }).catch(() => {
      document.getElementById('statusText').textContent = 'Offline';
    });

    // Salvage
    document.getElementById('salvageForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = document.getElementById('salvageResult');
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        let body;
        const input = document.getElementById('stateInput').value;
        try { body = JSON.parse(input); } catch { body = { state: input }; }
        const res = await fetch('/salvage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        result.className = 'result show ' + (data.error ? 'error' : 'success');
      } catch (err) {
        result.innerHTML = '<pre>Error: ' + err.message + '</pre>';
        result.className = 'result show error';
      }
      btn.disabled = false;
    });

    // Revive
    document.getElementById('reviveForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = document.getElementById('reviveResult');
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const txId = document.getElementById('txIdInput').value;
        const res = await fetch('/revive?txId=' + encodeURIComponent(txId));
        const data = await res.json();
        result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        result.className = 'result show ' + (data.error ? 'error' : 'success');
      } catch (err) {
        result.innerHTML = '<pre>Error: ' + err.message + '</pre>';
        result.className = 'result show error';
      }
      btn.disabled = false;
    });

    // Payment validation
    document.getElementById('payForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = document.getElementById('payResult');
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const signature = document.getElementById('sigInput').value;
        const res = await fetch('/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature })
        });
        const data = await res.json();
        result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        result.className = 'result show ' + (data.valid ? 'success' : 'error');
      } catch (err) {
        result.innerHTML = '<pre>Error: ' + err.message + '</pre>';
        result.className = 'result show error';
      }
      btn.disabled = false;
    });

    // Solana balance
    document.getElementById('solanaForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = document.getElementById('solanaResult');
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const address = document.getElementById('addressInput').value;
        const res = await fetch('/solana/balance/' + encodeURIComponent(address));
        const data = await res.json();
        result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        result.className = 'result show ' + (data.error ? 'error' : 'success');
      } catch (err) {
        result.innerHTML = '<pre>Error: ' + err.message + '</pre>';
        result.className = 'result show error';
      }
      btn.disabled = false;
    });
  </script>
</body>
</html>`);
});

// ============================================================
// START SERVER
// ============================================================

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    REVENANT BRIDGE                         ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${port}                              ║
║  Arweave: ${process.env.ARWEAVE_WALLET_JSON ? 'Configured' : 'Demo mode'}                               ║
║  Solana RPC: ${(process.env.SOLANA_RPC_URL || 'mainnet-beta').substring(0, 30)}...  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

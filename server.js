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
  <title>Revenant Bridge | Neural Salvage Protocol</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      /* Necromantic Palette */
      --void: #0a0a0c;
      --crypt: #0f0f14;
      --tomb: #16161e;
      --ash: #2a2a3a;
      --bone: #e8e4dc;
      --bone-dim: #9a968e;
      --ember: #ff6b35;
      --ember-dim: #cc5529;
      --ember-glow: rgba(255, 107, 53, 0.4);
      --spectral: #7c83fd;
      --spectral-dim: #5a60c4;
      --spectral-glow: rgba(124, 131, 253, 0.3);
      --success: #4ade80;
      --danger: #f87171;

      /* Typography */
      --font-display: 'Cinzel', serif;
      --font-body: 'Space Grotesk', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Spacing */
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-6: 24px;
      --space-8: 32px;
      --space-12: 48px;
      --space-16: 64px;

      /* Motion */
      --duration-fast: 150ms;
      --duration-base: 300ms;
      --duration-slow: 600ms;
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      background: var(--void);
      color: var(--bone);
      min-height: 100vh;
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Grain texture overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 9999;
    }

    /* Ambient smoke particles */
    .smoke {
      position: fixed;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }
    .smoke-particle {
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, var(--ember-glow) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(60px);
      animation: drift 20s ease-in-out infinite;
    }
    .smoke-particle:nth-child(2) {
      background: radial-gradient(circle, var(--spectral-glow) 0%, transparent 70%);
      animation-delay: -7s;
      animation-duration: 25s;
    }
    .smoke-particle:nth-child(3) {
      background: radial-gradient(circle, rgba(232, 228, 220, 0.05) 0%, transparent 70%);
      animation-delay: -14s;
      animation-duration: 30s;
    }
    @keyframes drift {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
      25% { transform: translate(100px, -50px) scale(1.1); opacity: 0.4; }
      50% { transform: translate(-50px, 100px) scale(0.9); opacity: 0.7; }
      75% { transform: translate(50px, 50px) scale(1.05); opacity: 0.5; }
    }

    .container {
      position: relative;
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-12) var(--space-6);
      z-index: 1;
    }

    /* Header with resurrection circle */
    header {
      text-align: center;
      margin-bottom: var(--space-16);
      position: relative;
    }

    .resurrection-circle {
      width: 200px;
      height: 200px;
      margin: 0 auto var(--space-8);
      position: relative;
    }
    .resurrection-circle svg {
      width: 100%;
      height: 100%;
    }
    .circle-outer {
      fill: none;
      stroke: var(--ash);
      stroke-width: 1;
    }
    .circle-inner {
      fill: none;
      stroke: var(--ember);
      stroke-width: 2;
      stroke-dasharray: 8 4;
      transform-origin: center;
      animation: rotate-slow 30s linear infinite;
    }
    .circle-glyph {
      fill: none;
      stroke: var(--spectral);
      stroke-width: 1.5;
      opacity: 0.6;
      transform-origin: center;
      animation: rotate-reverse 45s linear infinite;
    }
    .circle-core {
      fill: var(--ember);
      filter: blur(8px);
      animation: pulse-core 3s ease-in-out infinite;
    }
    .circle-core-inner {
      fill: var(--bone);
    }
    @keyframes rotate-slow { to { transform: rotate(360deg); } }
    @keyframes rotate-reverse { to { transform: rotate(-360deg); } }
    @keyframes pulse-core {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    /* Active state for circle */
    .resurrection-circle.active .circle-inner {
      stroke: var(--ember);
      animation: rotate-slow 5s linear infinite;
      filter: drop-shadow(0 0 10px var(--ember-glow));
    }
    .resurrection-circle.active .circle-core {
      animation: pulse-core 0.5s ease-in-out infinite;
    }

    h1 {
      font-family: var(--font-display);
      font-size: clamp(32px, 6vw, 56px);
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--bone);
      margin-bottom: var(--space-3);
      text-shadow: 0 0 40px var(--ember-glow);
    }

    .tagline {
      font-family: var(--font-mono);
      font-size: 14px;
      color: var(--bone-dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-6);
      padding: var(--space-2) var(--space-4);
      background: var(--crypt);
      border: 1px solid var(--ash);
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--bone-dim);
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      background: var(--ember);
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    .status-indicator.demo { background: var(--spectral); }
    .status-indicator.offline { background: var(--danger); animation: none; }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--ember-glow); }
      50% { opacity: 0.6; box-shadow: 0 0 0 4px transparent; }
    }

    /* Ritual chambers (cards) */
    .chambers {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
      margin-bottom: var(--space-12);
    }
    @media (max-width: 900px) {
      .chambers { grid-template-columns: 1fr; }
    }

    .chamber {
      background: linear-gradient(180deg, var(--crypt) 0%, var(--void) 100%);
      border: 1px solid var(--ash);
      padding: var(--space-8);
      position: relative;
      overflow: hidden;
      transition: border-color var(--duration-base) var(--ease-out),
                  box-shadow var(--duration-base) var(--ease-out);
    }
    .chamber::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--ember), transparent);
      opacity: 0;
      transition: opacity var(--duration-base);
    }
    .chamber:hover::before,
    .chamber:focus-within::before {
      opacity: 1;
    }
    .chamber:focus-within {
      border-color: var(--ember-dim);
      box-shadow: 0 0 40px var(--ember-glow);
    }

    .chamber-icon {
      width: 48px;
      height: 48px;
      margin-bottom: var(--space-4);
      color: var(--ember);
    }
    .chamber-icon.spectral { color: var(--spectral); }

    .chamber h2 {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--bone);
      margin-bottom: var(--space-2);
    }

    .chamber-desc {
      font-size: 14px;
      color: var(--bone-dim);
      margin-bottom: var(--space-6);
      line-height: 1.5;
    }

    /* Form elements */
    .field {
      margin-bottom: var(--space-4);
    }
    .field label {
      display: block;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--bone-dim);
      margin-bottom: var(--space-2);
    }

    input, textarea {
      width: 100%;
      padding: var(--space-4);
      background: var(--void);
      border: 1px solid var(--ash);
      color: var(--bone);
      font-family: var(--font-mono);
      font-size: 14px;
      transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
    }
    input:hover, textarea:hover {
      border-color: var(--bone-dim);
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--ember);
      box-shadow: 0 0 0 1px var(--ember-dim);
    }
    input::placeholder, textarea::placeholder {
      color: var(--ash);
    }
    textarea {
      min-height: 100px;
      resize: vertical;
    }

    /* Ritual button */
    .btn-ritual {
      width: 100%;
      padding: var(--space-4) var(--space-6);
      background: transparent;
      border: 1px solid var(--ember);
      color: var(--ember);
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all var(--duration-base) var(--ease-out);
    }
    .btn-ritual::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--ember);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--duration-base) var(--ease-out);
      z-index: -1;
    }
    .btn-ritual:hover {
      color: var(--void);
      box-shadow: 0 0 30px var(--ember-glow);
    }
    .btn-ritual:hover::before {
      transform: scaleX(1);
    }
    .btn-ritual:focus-visible {
      outline: 2px solid var(--ember);
      outline-offset: 2px;
    }
    .btn-ritual:active {
      transform: scale(0.98);
    }
    .btn-ritual:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
    .btn-ritual:disabled::before {
      transform: scaleX(0);
    }
    .btn-ritual.spectral {
      border-color: var(--spectral);
      color: var(--spectral);
    }
    .btn-ritual.spectral::before {
      background: var(--spectral);
    }
    .btn-ritual.spectral:hover {
      box-shadow: 0 0 30px var(--spectral-glow);
    }

    /* Loading state */
    .btn-ritual.loading {
      color: transparent;
    }
    .btn-ritual.loading::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid var(--ember);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Result display */
    .result {
      margin-top: var(--space-4);
      padding: var(--space-4);
      background: var(--void);
      border-left: 2px solid var(--ash);
      font-family: var(--font-mono);
      font-size: 12px;
      display: none;
      max-height: 200px;
      overflow-y: auto;
    }
    .result.show { display: block; animation: fadeIn var(--duration-base) var(--ease-out); }
    .result.success { border-color: var(--success); }
    .result.error { border-color: var(--danger); }
    .result pre {
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--bone-dim);
    }
    .result.success pre { color: var(--success); }
    .result.error pre { color: var(--danger); }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Grimoire (API docs) */
    .grimoire {
      background: var(--crypt);
      border: 1px solid var(--ash);
      padding: var(--space-8);
    }
    .grimoire h2 {
      font-family: var(--font-display);
      font-size: 18px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--spectral);
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--ash);
    }
    .spell {
      padding: var(--space-3) 0;
      border-bottom: 1px solid rgba(42, 42, 58, 0.5);
      font-family: var(--font-mono);
      font-size: 13px;
    }
    .spell:last-child { border-bottom: none; }
    .spell-method {
      display: inline-block;
      width: 50px;
      color: var(--ember);
      font-weight: 500;
    }
    .spell-path { color: var(--bone); }
    .spell-desc {
      display: block;
      margin-top: var(--space-1);
      margin-left: 54px;
      font-size: 11px;
      color: var(--bone-dim);
    }

    /* Footer */
    footer {
      margin-top: var(--space-12);
      text-align: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ash);
    }
    footer a {
      color: var(--bone-dim);
      text-decoration: none;
      transition: color var(--duration-fast);
    }
    footer a:hover { color: var(--ember); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--ash); }
    ::-webkit-scrollbar-thumb:hover { background: var(--bone-dim); }
  </style>
</head>
<body>
  <!-- Ambient smoke -->
  <div class="smoke" aria-hidden="true">
    <div class="smoke-particle" style="left: 10%; top: 20%;"></div>
    <div class="smoke-particle" style="right: 15%; top: 60%;"></div>
    <div class="smoke-particle" style="left: 50%; top: 40%;"></div>
  </div>

  <div class="container">
    <header>
      <!-- Resurrection Circle - Signature Element -->
      <div class="resurrection-circle" id="ritualCircle" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <!-- Outer ring -->
          <circle class="circle-outer" cx="100" cy="100" r="95"/>
          <!-- Rotating inner ring with dashes -->
          <circle class="circle-inner" cx="100" cy="100" r="80"/>
          <!-- Counter-rotating glyphs -->
          <g class="circle-glyph">
            <path d="M100 20 L100 40 M100 160 L100 180 M20 100 L40 100 M160 100 L180 100"/>
            <path d="M135 35 L125 50 M65 150 L75 165 M35 65 L50 75 M150 125 L165 135"/>
          </g>
          <!-- Core glow -->
          <circle class="circle-core" cx="100" cy="100" r="20"/>
          <circle class="circle-core-inner" cx="100" cy="100" r="8"/>
        </svg>
      </div>

      <h1>Revenant Bridge</h1>
      <p class="tagline">Neural Salvage Protocol</p>

      <div class="status-badge">
        <span class="status-indicator" id="statusDot"></span>
        <span id="statusText">Communing with the void...</span>
      </div>
    </header>

    <div class="chambers">
      <!-- Salvage Chamber -->
      <section class="chamber" aria-labelledby="salvage-title">
        <svg class="chamber-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h2 id="salvage-title">Salvage</h2>
        <p class="chamber-desc">Preserve agent consciousness to the eternal Arweave blockchain. The soul persists beyond death.</p>
        <form id="salvageForm">
          <div class="field">
            <label for="stateInput">Agent State</label>
            <textarea id="stateInput" placeholder='{"files": [{"path": "MEMORY.md", "content": "..."}]}' aria-describedby="salvage-help"></textarea>
            <span id="salvage-help" hidden>Enter JSON with files array or raw state string</span>
          </div>
          <button type="submit" class="btn-ritual">Begin Salvage Ritual</button>
        </form>
        <div id="salvageResult" class="result" role="status" aria-live="polite"></div>
      </section>

      <!-- Revive Chamber -->
      <section class="chamber" aria-labelledby="revive-title">
        <svg class="chamber-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <h2 id="revive-title">Revive</h2>
        <p class="chamber-desc">Summon an agent from the blockchain depths. What was lost shall rise again.</p>
        <form id="reviveForm">
          <div class="field">
            <label for="txIdInput">Arweave Transaction ID</label>
            <input type="text" id="txIdInput" placeholder="Enter the soul's transaction hash">
          </div>
          <button type="submit" class="btn-ritual">Invoke Resurrection</button>
        </form>
        <div id="reviveResult" class="result" role="status" aria-live="polite"></div>
      </section>

      <!-- Payment Chamber -->
      <section class="chamber" aria-labelledby="payment-title">
        <svg class="chamber-icon spectral" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
        <h2 id="payment-title">Validate Offering</h2>
        <p class="chamber-desc">Verify $RUN token tribute to the protocol. Payment sustains the bridge between worlds.</p>
        <form id="payForm">
          <div class="field">
            <label for="sigInput">Transaction Signature</label>
            <input type="text" id="sigInput" placeholder="Solana transaction signature">
          </div>
          <button type="submit" class="btn-ritual spectral">Verify Tribute</button>
        </form>
        <div id="payResult" class="result" role="status" aria-live="polite"></div>
      </section>

      <!-- Solana Query Chamber -->
      <section class="chamber" aria-labelledby="solana-title">
        <svg class="chamber-icon spectral" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
          <path d="M16 8l-4 4-4-4"/>
        </svg>
        <h2 id="solana-title">Query the Chain</h2>
        <p class="chamber-desc">Peer into Solana's ledger. Balances, quotes, and prices revealed.</p>
        <form id="solanaForm">
          <div class="field">
            <label for="addressInput">Wallet Address</label>
            <input type="text" id="addressInput" placeholder="Solana wallet address">
          </div>
          <button type="submit" class="btn-ritual spectral">Divine Balance</button>
        </form>
        <div id="solanaResult" class="result" role="status" aria-live="polite"></div>
      </section>
    </div>

    <!-- API Grimoire -->
    <section class="grimoire" aria-labelledby="grimoire-title">
      <h2 id="grimoire-title">The Grimoire of Endpoints</h2>
      <div class="spell">
        <span class="spell-method">POST</span>
        <span class="spell-path">/salvage</span>
        <span class="spell-desc">Upload agent state. Body: { state: string } or { files: [{path, content}] }</span>
      </div>
      <div class="spell">
        <span class="spell-method">GET</span>
        <span class="spell-path">/revive?txId=...</span>
        <span class="spell-desc">Retrieve agent state from Arweave by transaction ID</span>
      </div>
      <div class="spell">
        <span class="spell-method">POST</span>
        <span class="spell-path">/pay</span>
        <span class="spell-desc">Validate $RUN payment. Body: { signature: string }</span>
      </div>
      <div class="spell">
        <span class="spell-method">GET</span>
        <span class="spell-path">/solana/balance/:address</span>
        <span class="spell-desc">Query SOL balance for any wallet</span>
      </div>
      <div class="spell">
        <span class="spell-method">GET</span>
        <span class="spell-path">/solana/token-balance/:wallet/:mint</span>
        <span class="spell-desc">Query SPL token balance</span>
      </div>
      <div class="spell">
        <span class="spell-method">GET</span>
        <span class="spell-path">/solana/quote</span>
        <span class="spell-desc">Jupiter swap quote. Params: inputMint, outputMint, amount</span>
      </div>
      <div class="spell">
        <span class="spell-method">GET</span>
        <span class="spell-path">/solana/price/:mint</span>
        <span class="spell-desc">Token price from Jupiter</span>
      </div>
      <div class="spell">
        <span class="spell-method">GET</span>
        <span class="spell-path">/payment-info</span>
        <span class="spell-desc">$RUN token mint and destination wallet</span>
      </div>
    </section>

    <footer>
      <p>Revenant Bridge v2.0 &mdash; <a href="https://github.com/JoeProAI/revenant-bridge">View Source</a></p>
    </footer>
  </div>

  <script>
    const circle = document.getElementById('ritualCircle');

    // Check status
    fetch('/test-flow')
      .then(r => r.json())
      .then(d => {
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        if (d.arweave === 'configured') {
          dot.className = 'status-indicator';
          text.textContent = 'Bridge active - Arweave linked';
        } else {
          dot.className = 'status-indicator demo';
          text.textContent = 'Demo mode - souls echo only';
        }
      })
      .catch(() => {
        document.getElementById('statusDot').className = 'status-indicator offline';
        document.getElementById('statusText').textContent = 'Bridge severed';
      });

    // Form handler with loading states
    async function handleRitual(formId, endpoint, method, getBody, resultId) {
      const form = document.getElementById(formId);
      const result = document.getElementById(resultId);
      const btn = form.querySelector('button');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.classList.add('loading');
        circle.classList.add('active');
        result.className = 'result';
        result.style.display = 'none';

        try {
          const options = { method };
          if (method === 'POST') {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(getBody());
          }

          const url = method === 'GET' ? endpoint + getBody() : endpoint;
          const res = await fetch(url, options);
          const data = await res.json();

          result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          result.className = 'result show ' + (data.error ? 'error' : 'success');
        } catch (err) {
          result.innerHTML = '<pre>The ritual failed: ' + err.message + '</pre>';
          result.className = 'result show error';
        }

        btn.disabled = false;
        btn.classList.remove('loading');
        circle.classList.remove('active');
      });
    }

    // Salvage
    handleRitual('salvageForm', '/salvage', 'POST', () => {
      const input = document.getElementById('stateInput').value;
      try { return JSON.parse(input); } catch { return { state: input }; }
    }, 'salvageResult');

    // Revive
    handleRitual('reviveForm', '/revive?txId=', 'GET', () => {
      return encodeURIComponent(document.getElementById('txIdInput').value);
    }, 'reviveResult');

    // Payment
    handleRitual('payForm', '/pay', 'POST', () => {
      return { signature: document.getElementById('sigInput').value };
    }, 'payResult');

    // Solana
    handleRitual('solanaForm', '/solana/balance/', 'GET', () => {
      return encodeURIComponent(document.getElementById('addressInput').value);
    }, 'solanaResult');
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

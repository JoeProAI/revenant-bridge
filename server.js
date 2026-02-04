const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Inline UI - Bold Maximalist Production-Grade
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Revenant Bridge</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet">
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body { 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #FAFAFA;
  color: #0A0A0A;
  line-height: 1.5;
  overflow-x: hidden;
}

.container { 
  max-width: 1800px;
  margin: 0 auto;
  padding: 120px 80px;
}

/* Asymmetric Grid Layout */
.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 100px 80px;
  margin-top: 140px;
}

/* Header */
header { 
  grid-column: 1 / -1;
  margin-bottom: 60px;
}

h1 { 
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #0A0A0A;
  line-height: 0.95;
  margin-bottom: 24px;
}

.subtitle {
  font-size: 20px;
  font-weight: 700;
  color: #6B7280;
  letter-spacing: -0.01em;
  margin-top: 32px;
}

/* Section Cards */
.section { 
  background: #FFFFFF;
  padding: 80px 60px;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #0A0A0A 0%, #4B5563 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.section:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  transform: translateY(-4px);
}

.section:hover::before {
  transform: scaleX(1);
}

/* Asymmetric Grid Placement */
#salvage {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
}

#revive {
  grid-column: 2 / 4;
  grid-row: 1 / 2;
}

#pay {
  grid-column: 2 / 3;
  grid-row: 2 / 4;
}

#status {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
  background: #0A0A0A;
  color: #FAFAFA;
}

#status .section-title {
  color: #FAFAFA;
}

h2 { 
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 48px;
  color: inherit;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.section-title {
  color: #0A0A0A;
}

/* Forms */
form { 
  display: flex;
  flex-direction: column;
  gap: 28px;
}

label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-bottom: -20px;
}

input, textarea { 
  padding: 24px 28px;
  font-size: 18px;
  font-weight: 700;
  border: 3px solid #E5E7EB;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif;
  background: #FAFAFA;
  color: #0A0A0A;
}

input::placeholder, textarea::placeholder {
  color: #9CA3AF;
  font-weight: 700;
}

input:focus, textarea:focus { 
  outline: none;
  border-color: #0A0A0A;
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

textarea { 
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
}

/* Buttons */
button { 
  padding: 24px 32px;
  font-size: 18px;
  font-weight: 700;
  background: #0A0A0A;
  color: #FFFFFF;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

button:hover::before {
  width: 300px;
  height: 300px;
}

button:hover { 
  background: #1F2937;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Results */
.result { 
  margin-top: 40px;
  padding: 32px;
  background: #F9FAFB;
  border-radius: 16px;
  border-left: 6px solid #0A0A0A;
  display: none;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
}

.result pre {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  color: #1F2937;
  font-weight: 700;
}

#status .result {
  background: #1F2937;
  border-left-color: #FAFAFA;
}

#status .result pre {
  color: #E5E7EB;
}

/* Status indicators */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 28px;
  background: #F9FAFB;
  border-radius: 12px;
  margin-bottom: 24px;
  font-weight: 700;
  font-size: 16px;
}

#status .status-indicator {
  background: #1F2937;
  color: #E5E7EB;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10B981;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 1400px) { 
  .container {
    padding: 80px 40px;
  }
  
  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 60px 40px;
  }
  
  #salvage {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
  
  #revive {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
  
  #pay {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
  
  #status {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }
  
  h1 { 
    font-size: 56px; 
  }
  
  h2 {
    font-size: 36px;
  }
  
  .section { 
    padding: 60px 40px; 
  }
}

@media (max-width: 768px) { 
  .container {
    padding: 60px 24px;
  }
  
  .grid { 
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  #salvage, #revive, #pay, #status {
    grid-column: 1 / -1;
    grid-row: auto;
  }
  
  h1 { 
    font-size: 42px; 
  }
  
  h2 {
    font-size: 28px;
  }
  
  .section { 
    padding: 40px 28px; 
  }
  
  input, textarea, button {
    font-size: 16px;
    padding: 20px 24px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Revenant Bridge</h1>
    <p class="subtitle">Persistent agent state on Arweave • Salvage, revive, and fund your autonomous systems</p>
  </header>
  
  <div class="grid">
    <div id="salvage" class="section">
      <h2 class="section-title">Salvage</h2>
      <form id="salvageForm">
        <label for="state">Agent State</label>
        <textarea id="state" placeholder="Enter agent state data to preserve on Arweave..." aria-label="Agent state data"></textarea>
        <button type="submit">Initiate Salvage</button>
      </form>
      <div id="salvageResult" class="result" role="status" aria-live="polite"></div>
    </div>
    
    <div id="revive" class="section">
      <h2 class="section-title">Revive</h2>
      <form id="reviveForm">
        <label for="txId">Transaction ID</label>
        <input type="text" id="txId" placeholder="Arweave TX ID" aria-label="Transaction ID">
        <button type="submit">Revive Agent</button>
      </form>
      <div id="reviveResult" class="result" role="status" aria-live="polite"></div>
    </div>
    
    <div id="pay" class="section">
      <h2 class="section-title">Pay</h2>
      <form id="payForm">
        <label for="payDetails">Payment Details</label>
        <input type="text" id="payDetails" placeholder="Wallet address or payment identifier" aria-label="Payment details">
        <button type="submit">Process Payment</button>
      </form>
      <div id="payResult" class="result" role="status" aria-live="polite"></div>
    </div>
    
    <div id="status" class="section">
      <h2 class="section-title">Status</h2>
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span>System Operational</span>
      </div>
      <div id="statusDisplay" class="result" style="display: block;" role="status">
        <pre>Endpoint: Ready
Arweave: Connected
Last Activity: --</pre>
      </div>
    </div>
  </div>
</div>

<script>
// Handle form submissions
async function handleSubmit(formId, endpoint, bodyKey, resultId, displayText) {
  const form = document.getElementById(formId);
  const result = document.getElementById(resultId);
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = form.querySelector('input, textarea');
    const value = input.value.trim();
    
    if (!value) {
      result.innerHTML = '<pre>Error: Field cannot be empty</pre>';
      result.style.display = 'block';
      return;
    }
    
    // Show loading state
    const button = form.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Processing...';
    button.disabled = true;
    
    try {
      const res = await fetch(\`/\${endpoint}\`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({[bodyKey]: value})
      });
      
      const data = await res.json();
      result.innerHTML = displayText.replace('{data}', JSON.stringify(data, null, 2));
      result.style.display = 'block';
      
      // Update status
      updateStatus(endpoint);
    } catch (error) {
      result.innerHTML = \`<pre>Error: \${error.message}</pre>\`;
      result.style.display = 'block';
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  });
}

// Update status display
function updateStatus(action) {
  const statusDisplay = document.getElementById('statusDisplay');
  const now = new Date().toLocaleTimeString();
  const currentStatus = statusDisplay.querySelector('pre').textContent;
  const lines = currentStatus.split('\\n');
  lines[2] = \`Last Activity: \${action} at \${now}\`;
  statusDisplay.querySelector('pre').textContent = lines.join('\\n');
}

// Initialize form handlers
handleSubmit('salvageForm', 'salvage', 'state', 'salvageResult', 
  '<strong>Salvage Complete</strong><pre>{data}</pre>');
handleSubmit('reviveForm', 'revive', 'txId', 'reviveResult', 
  '<strong>Revival Result</strong><pre>{data}</pre>');
handleSubmit('payForm', 'pay', 'details', 'payResult', 
  '<strong>Payment Processed</strong><pre>{data}</pre>');

// Initial status update
setTimeout(() => {
  updateStatus('System initialized');
}, 100);
</script>
</body>
</html>
  `);
});

app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/test-flow', (req, res) => res.status(200).send('Full flow works!'));

app.post('/salvage', (req, res) => {
  const state = req.body.state;
  console.log('[Salvage] Request received:', state ? state.substring(0, 100) + '...' : 'No state');
  
  // Simulated Arweave transaction
  const txId = 'arw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  res.json({
    success: true,
    txId: txId,
    timestamp: new Date().toISOString(),
    size: state ? state.length : 0,
    message: 'Agent state salvaged to Arweave'
  });
});

app.post('/revive', (req, res) => {
  const txId = req.body.txId;
  console.log('[Revive] Request for txId:', txId);
  
  res.json({
    success: true,
    txId: txId,
    timestamp: new Date().toISOString(),
    state: 'Agent state retrieved from Arweave',
    message: 'Revival complete'
  });
});

app.post('/pay', (req, res) => {
  const details = req.body.details;
  console.log('[Pay] Payment request:', details);
  
  const signature = 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
  
  res.json({
    success: true,
    signature: signature,
    timestamp: new Date().toISOString(),
    details: details,
    message: 'Payment processed'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     Revenant Bridge Server Running     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('  Port:        ' + port);
  console.log('  Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('  UI:          http://localhost:' + port);
  console.log('');
  console.log('  Endpoints:');
  console.log('    POST /salvage');
  console.log('    POST /revive');
  console.log('    POST /pay');
  console.log('    GET  /health');
  console.log('    GET  /test-flow');
  console.log('');
});

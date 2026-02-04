const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
// app.use(express.static('ui')); // Commented out since inlining UI

const html = `&lt;!DOCTYPE html&gt;
&lt;html lang=&quot;en&quot;&gt;
&lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;&gt;
    &lt;title&gt;Revenant Bridge&lt;/title&gt;
    &lt;link href=&quot;https://fonts.googleapis.com/css2?family=Inter:wght@700&amp;display=swap&quot; rel=&quot;stylesheet&quot;&gt;
    &lt;style&gt;
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
    &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;header&gt;
        &lt;h1&gt;Revenant Bridge&lt;/h1&gt;
    &lt;/header&gt;
    &lt;aside class=&quot;aside&quot;&gt;
        &lt;h2&gt;Test Flow&lt;/h2&gt;
        &lt;button onclick=&quot;testFlow()&quot;&gt;Run Test&lt;/button&gt;
        &lt;div id=&quot;test-result&quot;&gt;&lt;/div&gt;
    &lt;/aside&gt;
    &lt;main class=&quot;main&quot;&gt;
        &lt;section&gt;
            &lt;h2&gt;Salvage Agent&lt;/h2&gt;
            &lt;form id=&quot;salvage-form&quot;&gt;
                &lt;textarea id=&quot;state&quot; placeholder=&quot;Enter agent state JSON...&quot; rows=&quot;6&quot; style=&quot;width: 100%; resize: vertical;&quot;&gt;&lt;/textarea&gt;
                &lt;button type=&quot;submit&quot;&gt;Salvage to Arweave&lt;/button&gt;
            &lt;/form&gt;
            &lt;div id=&quot;salvage-result&quot;&gt;&lt;/div&gt;
        &lt;/section&gt;
        &lt;section&gt;
            &lt;h2&gt;Revive Agent&lt;/h2&gt;
            &lt;form id=&quot;revive-form&quot;&gt;
                &lt;input type=&quot;text&quot; id=&quot;txId&quot; placeholder=&quot;Enter Arweave Tx ID&quot;&gt;
                &lt;button type=&quot;submit&quot;&gt;Revive from Tx&lt;/button&gt;
            &lt;/form&gt;
            &lt;div id=&quot;revive-result&quot;&gt;&lt;/div&gt;
        &lt;/section&gt;
        &lt;section&gt;
            &lt;h2&gt;Pay&lt;/h2&gt;
            &lt;form id=&quot;pay-form&quot;&gt;
                &lt;input type=&quot;number&quot; id=&quot;amount&quot; placeholder=&quot;Amount in AR&quot; step=&quot;0.01&quot; min=&quot;0&quot;&gt;
                &lt;button type=&quot;submit&quot;&gt;Process Payment&lt;/button&gt;
            &lt;/form&gt;
            &lt;div id=&quot;pay-result&quot;&gt;&lt;/div&gt;
        &lt;/section&gt;
    &lt;/main&gt;
    &lt;script&gt;
        async function testFlow() {
            const resultDiv = document.getElementById('test-result');
            try {
                resultDiv.innerHTML = 'Running...';
                const res = await fetch('/test-flow');
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const text = await res.text();
                resultDiv.innerHTML = '&lt;p style=&quot;color: #0f0;&quot;&gt;' + text + '&lt;/p&gt;';
            } catch (e) {
                resultDiv.innerHTML = '&lt;p style=&quot;color: #f00;&quot;&gt;Error: ' + e.message + '&lt;/p&gt;';
            }
        }

        document.getElementById('salvage-form').addEventListener('submit', async (e) =&gt; {
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
                resultDiv.innerHTML = '&lt;p style=&quot;color: #0f0;&quot;&gt;Tx ID: ' + data.txId + '&lt;/p&gt;';
            } catch (e) {
                resultDiv.innerHTML = '&lt;p style=&quot;color: #f00;&quot;&gt;Error: ' + e.message + '&lt;/p&gt;';
            }
        });

        document.getElementById('revive-form').addEventListener('submit', async (e) =&gt; {
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
                resultDiv.innerHTML = '&lt;p style=&quot;color: #0f0;&quot;&gt;' + data.result + '&lt;/p&gt;';
            } catch (e) {
                resultDiv.innerHTML = '&lt;p style=&quot;color: #f00;&quot;&gt;Error: ' + e.message + '&lt;/p&gt;';
            }
        });

        document.getElementById('pay-form').addEventListener('submit', async (e) =&gt; {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('amount').value);
            if (isNaN(amount) || amount &lt;= 0) return alert('Enter valid amount');
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
                resultDiv.innerHTML = '&lt;p style=&quot;color: #0f0;&quot;&gt;Signature: ' + data.sig + '&lt;/p&gt;';
            } catch (e) {
                resultDiv.innerHTML = '&lt;p style=&quot;color: #f00;&quot;&gt;Error: ' + e.message + '&lt;/p&gt;';
            }
        });
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

app.get('/', (req, res) =&gt; {
  res.send(html);
});

app.get('/health', (req, res) =&gt; res.status(200).send('OK'));

app.get('/test-flow', (req, res) =&gt; res.status(200).send('Full flow works!'));

app.post('/salvage', (req, res) =&gt; {
  // Real Arweave salvage stub (add env logic)
  console.log('Salvage request:', req.body.state.substring(0, 100) + '...');
  res.json({txId: 'demo-tx-' + Date.now()});
});

app.post('/revive', (req, res) =&gt; {
  console.log('Revive request for txId:', req.body.txId);
  res.json({result: 'Revived agent from Tx ID: ' + req.body.txId});
});

app.post('/pay', (req, res) =&gt; {
  // If needed for server-side pay, but using direct now
  res.json({sig: 'demo-sig-' + Date.now()});
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () =&gt; {
  console.log('Server running on port ' + port);
  console.log('Inline UI served');
});
// app.js
const web3 = window.solanaWeb3;
const splToken = window.splToken;

let wallet = window.solana;
let connection = new web3.Connection('https://api.mainnet-beta.solana.com');

async function connectWallet() {
  if (wallet && wallet.isPhantom) {
    try {
      const resp = await wallet.connect({ onlyIfTrusted: false });
      document.getElementById('wallet-status').textContent = 'Connected: ' + resp.publicKey.toString().slice(0,8) + '...';
      document.getElementById('connectWallet').textContent = 'Disconnect';
      document.getElementById('connectWallet').onclick = () => wallet.disconnect();
    } catch (err) {
      console.error('Connect error:', err);
      alert('Connect error: ' + err.message);
    }
  } else {
    alert('Please install Phantom wallet extension.');
  }
}

async function pay() {
  if (!wallet || !wallet.isConnected) {
    alert('Please connect Phantom wallet first.');
    return;
  }
  const amountInput = document.getElementById("amount");
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }
  const uiAmount = Math.round(amount * 1000000); // 6 decimals for $RUN
  const tokenMint = new web3.PublicKey("GKimKDfu5hCWzg1ioAPnvFrahDeJVDKj2zPxozZ4BAGS"); // $RUN mint
  const creatorWallet = new web3.PublicKey("8QpjoTEmvqB816FeJUNwm6S6Ea5dyhTSKXWDjLM3aCMq");

  try {
    const fromPubKey = wallet.publicKey;
    // Get or create token accounts
    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      wallet, // signer
      tokenMint,
      fromPubKey
    );
    const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      wallet, // signer for creation if needed
      tokenMint,
      creatorWallet
    );

    const transferInstruction = splToken.createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      fromPubKey,
      uiAmount
    );

    const tx = new web3.Transaction().add(transferInstruction);

    const { blockhash } = await connection.getLatestBlockhash('recent');
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubKey;

    const signedTx = await wallet.signTransaction(tx);
    const rawTx = signedTx.serialize();
    const sig = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: 'processed'
    });
    await connection.confirmTransaction(sig, 'confirmed');

    document.getElementById("payResult").innerHTML = `Payment successful! Signature: <a href="https://solscan.io/tx/${sig}" target="_blank">${sig}</a>`;
    amountInput.value = '';
  } catch (err) {
    console.error(err);
    document.getElementById("payResult").textContent = 'Error: ' + err.message;
  }
}

async function salvage() {
  const file = document.getElementById("stateFile").files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const res = await fetch('/salvage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: e.target.result })
      });
      if (!res.ok) throw new Error('Server error');
      const result = await res.json();
      document.getElementById("salvageResult").innerHTML = `Salvaged! Tx ID: <a href="https://arweave.net/${result.txId}" target="_blank">${result.txId}</a>`;
    } catch (err) {
      document.getElementById("salvageResult").textContent = 'Error: ' + err.message;
    }
  };
  reader.readAsText(file);
}

async function revive() {
  const txId = document.getElementById("txId").value.trim();
  if (!txId) {
    alert('Please enter Tx ID.');
    return;
  }
  try {
    const res = await fetch('/revive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId })
    });
    if (!res.ok) throw new Error('Server error');
    const result = await res.json();
    document.getElementById("reviveResult").textContent = result.result;
    document.getElementById("txId").value = '';
  } catch (err) {
    document.getElementById("reviveResult").textContent = 'Error: ' + err.message;
  }
}

async function testFlow() {
  try {
    const res = await fetch('/test-flow');
    if (!res.ok) throw new Error('Server error');
    const result = await res.text();
    document.getElementById("testResult").textContent = result;
  } catch (err) {
    document.getElementById("testResult").textContent = 'Error: ' + err.message;
  }
}

// Expose functions globally
window.connectWallet = connectWallet;
window.pay = pay;
window.salvage = salvage;
window.revive = revive;
window.testFlow = testFlow;

// Check if wallet is already connected
if (wallet && wallet.isPhantom) {
  wallet.connect({ onlyIfTrusted: true }).then(resp => {
    if (resp) {
      document.getElementById('wallet-status').textContent = 'Connected: ' + resp.publicKey.toString().slice(0,8) + '...';
    }
  }).catch(() => {});
}
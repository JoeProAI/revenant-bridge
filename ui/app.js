// app.js: Pure @solana/web3.js for Phantom (no adapters, no native deps)
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

let wallet = window.solana; // Phantom
let connection = new web3.Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

async function connectWallet() {
  if (wallet && wallet.isPhantom) {
    try {
      const resp = await wallet.connect();
      document.getElementById('wallet-status').textContent = 'Connected: ' + resp.publicKey.toString();
    } catch (err) {
      console.error('Connect error:', err);
    }
  } else {
    alert('Install Phantom extension');
  }
}

async function pay() {
  if (!wallet || !wallet.connected) return alert('Connect Phantom first');
  const amount = parseInt(document.getElementById("amount").value * 1e6); // Lamports for $RUN
  const tokenContract = new web3.PublicKey("GKimKDfu5hCWzg1ioAPnvFrahDeJVDKj2zPxozZ4BAGS");
  const creatorWallet = new web3.PublicKey("8QpjoTEmvqB816FeJUNwm6S6Ea5dyhTSKXWDjLM3aCMq");

  try {
    const fromPubKey = wallet.publicKey;
    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, wallet, tokenContract, fromPubKey);
    const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, wallet, tokenContract, creatorWallet);

    const tx = new web3.Transaction().add(
      splToken.createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromPubKey,
        amount
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubKey;

    const signedTx = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(sig);
    document.getElementById("payResult").textContent = `Signature: ${sig} (Confirmed on mainnet)`;
  } catch (err) {
    document.getElementById("payResult").textContent = 'Error: ' + err.message;
  }
}

// Salvage, revive, testFlow as before (fetch to server)
async function salvage() {
  const file = document.getElementById("stateFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const res = await fetch('/salvage', { method: 'POST', body: JSON.stringify({ state: e.target.result }) });
    const result = await res.json();
    document.getElementById("salvageResult").textContent = `Tx ID: ${result.txId}`;
  };
  reader.readAsText(file);
}

async function revive() {
  const txId = document.getElementById("txId").value;
  const res = await fetch('/revive', { method: 'POST', body: JSON.stringify({ txId }) });
  const result = await res.json();
  document.getElementById("reviveResult").textContent = result.result;
}

async function testFlow() {
  const res = await fetch('/test-flow');
  document.getElementById("testResult").textContent = await res.text();
}

// Add connect button
document.getElementById('wallet-adapter').innerHTML = '<button onclick="connectWallet()">Connect Phantom</button><p id="wallet-status"></p>';

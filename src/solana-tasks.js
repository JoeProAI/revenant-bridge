// src/solana-tasks.js: Solana tasks (query/transfer/DeFi)
const web3 = require(\"@solana/web3.js\");
const connection = new web3.Connection(\"https://api.mainnet-beta.solana.com\");

async function checkBalance(address) {
  const pubKey = new web3.PublicKey(address);
  return await connection.getBalance(pubKey);
}

async function simpleTransfer(fromKeypair, toPubkey, amount) {
  const tx = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPubkey,
      lamports: amount,
    })
  );
  const sig = await web3.sendAndConfirmTransaction(connection, tx, [fromKeypair]);
  return sig;
}
// Add DeFi checks (e.g., Jupiter swap quote)
async function getJupiterQuote(inputMint, outputMint, amount) {
  // Call Jupiter API (placeholder; use actual fetch)
  const response = await fetch(`https://quote-api.jup.ag/v4/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`);
  return await response.json();
}
module.exports = { checkBalance, simpleTransfer, getJupiterQuote };

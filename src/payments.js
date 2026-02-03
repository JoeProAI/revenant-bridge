// src/payments.js: $RUN onchain payments
const web3 = require(\"@solana/web3.js\");
const splToken = require(\"@solana/spl-token\");
const connection = new web3.Connection(\"https://api.mainnet-beta.solana.com\");
const RUN_CONTRACT = new web3.PublicKey(\"GKimKDfu5hCWzg1ioAPnvFrahDeJVDKj2zPxozZ4BAGS\");
const CREATOR_WALLET = new web3.PublicKey(\"8QpjoTEmvqB816FeJUNwm6S6Ea5dyhTSKXWDjLM3aCMq\");

async function processRunPayment(fromKeypair, amount) {
  const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, fromKeypair, RUN_CONTRACT, fromKeypair.publicKey);
  const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, fromKeypair, RUN_CONTRACT, CREATOR_WALLET);
  const sig = await splToken.transfer(connection, fromKeypair, fromTokenAccount.address, toTokenAccount.address, fromKeypair.publicKey, amount);
  return sig;
}
module.exports = { processRunPayment };

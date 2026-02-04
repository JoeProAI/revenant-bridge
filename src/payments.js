// src/payments.js: $RUN SPL token payments
const { Connection, PublicKey } = require("@solana/web3.js");
const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = require("@solana/spl-token");

// $RUN token contract
const RUN_MINT = new PublicKey("GKimKDfu5hCWzg1ioAPnvFrahDeJVDKj2zPxozZ4BAGS");
// Creator wallet - receives payments
const CREATOR_WALLET = new PublicKey("8QpjoTEmvqB816FeJUNwm6S6Ea5dyhTSKXWDjLM3aCMq");

/**
 * Get Solana connection (uses env var or defaults to mainnet)
 */
function getConnection() {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  return new Connection(rpcUrl, "confirmed");
}

/**
 * Validate a $RUN payment transaction
 * @param {string} signature - Transaction signature to validate
 * @param {number} expectedAmount - Expected amount in base units
 * @returns {Promise<{valid: boolean, amount?: number, error?: string}>}
 */
async function validateRunPayment(signature, expectedAmount = 0) {
  const connection = getConnection();

  try {
    // Fetch transaction
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      return { valid: false, error: "Transaction not found" };
    }

    if (tx.meta?.err) {
      return { valid: false, error: "Transaction failed" };
    }

    // Look for SPL token transfer to creator wallet
    const instructions = tx.transaction.message.instructions;
    let paymentFound = false;
    let amount = 0;

    for (const ix of instructions) {
      // Check if it's a token program instruction
      if (ix.programId?.toString() === TOKEN_PROGRAM_ID.toString()) {
        const parsed = ix.parsed;
        if (parsed?.type === "transfer" || parsed?.type === "transferChecked") {
          const info = parsed.info;
          // Check if destination is creator's $RUN token account
          const creatorAta = await getAssociatedTokenAddress(RUN_MINT, CREATOR_WALLET);
          if (info.destination === creatorAta.toString() || info.destination === CREATOR_WALLET.toString()) {
            paymentFound = true;
            amount = parseInt(info.amount || info.tokenAmount?.amount || 0);
          }
        }
      }
    }

    if (!paymentFound) {
      return { valid: false, error: "No $RUN transfer to creator wallet found" };
    }

    if (expectedAmount > 0 && amount < expectedAmount) {
      return { valid: false, error: `Insufficient amount: got ${amount}, expected ${expectedAmount}` };
    }

    return {
      valid: true,
      amount,
      signature,
      blockTime: tx.blockTime
    };
  } catch (error) {
    console.error("[Payments] Validation error:", error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Get payment info for client-side signing
 * Returns the destination wallet and token mint for Phantom to construct tx
 */
function getPaymentInfo() {
  return {
    mint: RUN_MINT.toString(),
    destination: CREATOR_WALLET.toString(),
    symbol: "$RUN",
    decimals: 9 // Most SPL tokens use 9 decimals
  };
}

module.exports = {
  validateRunPayment,
  getPaymentInfo,
  RUN_MINT,
  CREATOR_WALLET,
  getConnection
};

// src/solana-tasks.js: Solana DeFi tasks for revived agents
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

/**
 * Get Solana connection
 */
function getConnection() {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  return new Connection(rpcUrl, "confirmed");
}

/**
 * Check SOL balance for an address
 * @param {string} address - Wallet address
 * @returns {Promise<{lamports: number, sol: number}>}
 */
async function checkBalance(address) {
  const connection = getConnection();
  const pubKey = new PublicKey(address);
  const lamports = await connection.getBalance(pubKey);
  return {
    lamports,
    sol: lamports / LAMPORTS_PER_SOL
  };
}

/**
 * Check SPL token balance
 * @param {string} walletAddress - Wallet address
 * @param {string} tokenMint - Token mint address
 * @returns {Promise<{balance: number, decimals: number}>}
 */
async function checkTokenBalance(walletAddress, tokenMint) {
  const connection = getConnection();
  const { getAssociatedTokenAddress, getAccount } = require("@solana/spl-token");

  try {
    const wallet = new PublicKey(walletAddress);
    const mint = new PublicKey(tokenMint);
    const ata = await getAssociatedTokenAddress(mint, wallet);
    const account = await getAccount(connection, ata);

    return {
      balance: Number(account.amount),
      decimals: 9, // Could fetch from mint
      address: ata.toString()
    };
  } catch (error) {
    if (error.message?.includes("could not find account")) {
      return { balance: 0, decimals: 9, address: null };
    }
    throw error;
  }
}

/**
 * Get Jupiter swap quote (v6 API)
 * @param {string} inputMint - Input token mint
 * @param {string} outputMint - Output token mint
 * @param {number} amount - Amount in base units
 * @returns {Promise<object>}
 */
async function getJupiterQuote(inputMint, outputMint, amount) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Jupiter API error: ${response.status}`);
  }

  const quote = await response.json();
  return {
    inputMint,
    outputMint,
    inputAmount: amount,
    outputAmount: quote.outAmount,
    priceImpactPct: quote.priceImpactPct,
    routePlan: quote.routePlan?.map(r => r.swapInfo?.label).filter(Boolean)
  };
}

/**
 * Get token price from Jupiter
 * @param {string} tokenMint - Token mint address
 * @returns {Promise<{price: number, symbol?: string}>}
 */
async function getTokenPrice(tokenMint) {
  const url = `https://price.jup.ag/v6/price?ids=${tokenMint}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Jupiter price API error: ${response.status}`);
  }

  const data = await response.json();
  const tokenData = data.data?.[tokenMint];

  return {
    mint: tokenMint,
    price: tokenData?.price || 0,
    symbol: tokenData?.mintSymbol
  };
}

/**
 * Get recent transactions for an address
 * @param {string} address - Wallet address
 * @param {number} limit - Max transactions to fetch
 * @returns {Promise<Array>}
 */
async function getRecentTransactions(address, limit = 10) {
  const connection = getConnection();
  const pubKey = new PublicKey(address);

  const signatures = await connection.getSignaturesForAddress(pubKey, { limit });

  return signatures.map(sig => ({
    signature: sig.signature,
    slot: sig.slot,
    blockTime: sig.blockTime,
    status: sig.err ? "failed" : "success"
  }));
}

module.exports = {
  getConnection,
  checkBalance,
  checkTokenBalance,
  getJupiterQuote,
  getTokenPrice,
  getRecentTransactions
};


import { ethers } from 'ethers';

// Minimal ERC-20 ABI for fetching balance, decimals, and name/symbol as a fallback
export const ERC20_ABI = [
    { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" }
];

const TOKEN_LISTS = {
    1: 'https://tokens.coingecko.com/uniswap/all.json',
    56: 'https://tokens.coingecko.com/binance-smart-chain/all.json',
    137: 'https://tokens.coingecko.com/polygon-pos/all.json',
    10: 'https://tokens.coingecko.com/optimistic-ethereum/all.json',
    42161: 'https://tokens.coingecko.com/arbitrum-one/all.json',
  };

/**
 * Fetches a list of tokens for a given network chain ID from a predefined token list URL.
 * @param {number} chainId - The chain ID of the network.
 * @returns {Promise<Array>} - A promise that resolves to an array of token objects.
 */
export const fetchTokensForNetwork = async (chainId) => {
    const url = TOKEN_LISTS[chainId];
    if (!url) {
        console.warn(`No token list found for chainId: ${chainId}`);
        return [];
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch token list: ${response.statusText}`);
        }
        const data = await response.json();
        
        // The token list format might have the tokens nested under a `tokens` key
        const tokens = data.tokens || data;
        if (!Array.isArray(tokens)) {
            throw new Error('Token list format is invalid');
        }

        return tokens.map(token => ({ ...token, coingeckoId: token.id }));
    } catch (error) {
        console.error(`Error fetching token list for chainId ${chainId}:`, error);
        return [];
    }
};


/**
 * Fetches the details of a specific token by its contract address.
 * @param {string} tokenAddress - The contract address of the token.
 * @param {ethers.Provider} provider - An ethers.js provider instance.
 * @returns {Promise<Object|null>} - A promise that resolves to an object with token details (name, symbol, decimals) or null if it fails.
 */
export const fetchTokenDetails = async (tokenAddress, provider) => {
    if (!tokenAddress || !provider) {
        console.warn('fetchTokenDetails requires a tokenAddress and a provider.');
        return null;
    }

    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

        // Fetch properties in parallel
        const [name, symbol, decimals] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals()
        ]);

        const details = { address: tokenAddress, name, symbol, decimals: Number(decimals) };
        console.log(`Fetched details for token at ${tokenAddress}:`, details);

        return details;
    } catch (error) {
        console.error(`Failed to fetch details for token at ${tokenAddress}:`, error);
        return null;
    }
};

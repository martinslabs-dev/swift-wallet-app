
import axios from 'axios';

// Minimal ERC-20 ABI for fetching balance, decimals, and name/symbol as a fallback
export const ERC20_ABI = [
    { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" }
];

// In-memory cache for token lists to prevent redundant API calls
const tokenListCache = {};

/**
 * Fetches a list of tokens for a given network from the 1inch API.
 * Implements in-memory caching.
 * @param {number} chainId - The chain ID of the network.
 * @returns {Promise<Array>} - A promise that resolves to an array of token objects.
 */
export const fetchTokensForNetwork = async (chainId) => {
    if (!chainId) {
        console.warn('No chainId provided to fetchTokensForNetwork');
        return [];
    }

    // Return from cache if available
    if (tokenListCache[chainId]) {
        return tokenListCache[chainId];
    }

    try {
        // Using 1inch token list API. v1.2 is the latest as of writing.
        const url = `https://tokens.1inch.io/v1.2/${chainId}`;
        const response = await axios.get(url);

        // The token data from 1inch is an object where keys are token addresses
        const tokens = Object.values(response.data.tokens);

        // Store in cache for subsequent requests
        tokenListCache[chainId] = tokens;

        console.log(`Fetched and cached ${tokens.length} tokens for chainId ${chainId}.`);
        return tokens;
    } catch (error) {
        console.error(`Failed to fetch token list for chainId ${chainId}:`, error);
        // Return an empty array on failure to prevent the app from crashing
        return [];
    }
};

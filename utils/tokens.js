
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
 * Implements in-memory caching and robust error handling.
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
        const url = `https://tokens.1inch.io/v1.2/${chainId}`;
        const response = await axios.get(url);

        // Guard against cases where the API returns a 200 OK but no token data
        if (response.data && response.data.tokens) {
            const tokens = Object.values(response.data.tokens);
            tokenListCache[chainId] = tokens;
            console.log(`Fetched and cached ${tokens.length} tokens for chainId ${chainId}.`);
            return tokens;
        } else {
            console.warn(`No token data returned from 1inch for chainId ${chainId}.`);
            tokenListCache[chainId] = []; // Cache the empty result
            return [];
        }
    } catch (error) {
        // Handle specific Axios 400 errors gracefully
        if (error.response && error.response.status === 400) {
            console.warn(`1inch API returned a 400 Bad Request for chainId ${chainId}. This network may not be supported. Proceeding with an empty token list.`);
        } else {
            // Log other errors more verbosely
            console.error(`An unexpected error occurred while fetching the token list for chainId ${chainId}:`, error);
        }

        // For any error, cache the empty result to prevent repeated failures
        tokenListCache[chainId] = [];
        return [];
    }
};

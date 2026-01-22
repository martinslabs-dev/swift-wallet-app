
// Minimal ERC-20 ABI for fetching balance and decimals
export const ERC20_ABI = [
    { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
];

// Supported token contracts for different networks
export const SUPPORTED_TOKENS = {
    USDT: {
        name: 'Tether USD',
        symbol: 'USDT',
        networks: {
            mainnet: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
            sepolia: { address: '0xaA8E23Fb4C70490F1d2dF9f14D2705Db53eC822e' },
        }
    },
    USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        networks: {
            mainnet: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
            sepolia: { address: '0x94a9D9AC8a22534E3FaCa422B727b124bB9B776c' },
        }
    },
    // Add other tokens here
};

/**
 * A helper function to get the list of tokens supported on a specific network.
 * @param {string} networkId - The ID of the network (e.g., 'mainnet', 'sepolia').
 * @returns {Array} - A list of token objects with their network-specific address.
 */
export const getTokensForNetwork = (networkId) => {
    return Object.values(SUPPORTED_TOKENS).map(token => {
        if (token.networks[networkId]) {
            return {
                name: token.name,
                symbol: token.symbol,
                address: token.networks[networkId].address
            };
        }
        return null;
    }).filter(Boolean); // Filter out tokens not available on the specified network
};

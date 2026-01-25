
import { ethers } from 'ethers';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// A placeholder for a more robust token discovery mechanism
const fetchPopularTokens = async (chainId) => {
    // For now, we'll use a hardcoded list of popular tokens
    // In a real application, you'd fetch this from a reliable source
    const popularTokens = {
        1: [ // Ethereum Mainnet
            { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
            { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
        ],
        // Add other chains as needed
    };
    return popularTokens[chainId] || [];
};


export const tokenService = {
    /**
     * Scans for new tokens by checking the balance of popular tokens.
     * @param {string} userAddress - The user's wallet address.
     * @param {ethers.Provider} provider - The ethers provider for the current network.
     * @param {Array} existingTokens - The list of tokens the user already has.
     * @param {number} chainId - The ID of the current chain.
     * @returns {Array} - A list of newly discovered tokens with balances.
     */
    async detectNewTokens(userAddress, provider, existingTokens, chainId) {
        const newTokens = [];
        try {
            const popularTokens = await fetchPopularTokens(chainId);
            const existingTokenAddresses = new Set(existingTokens.map(t => t.address.toLowerCase()));

            const tokenPromises = popularTokens.map(async (token) => {
                if (existingTokenAddresses.has(token.address.toLowerCase())) {
                    return null; // Skip tokens the user already has
                }

                try {
                    const contract = new ethers.Contract(token.address, ['function balanceOf(address) view returns (uint256)'], provider);
                    const balance = await contract.balanceOf(userAddress);

                    if (balance > 0) {
                        return {
                            ...token,
                            balance: ethers.formatUnits(balance, token.decimals),
                        };
                    }
                } catch (error) {
                    // Ignore errors for individual tokens
                }
                return null;
            });

            const results = await Promise.all(tokenPromises);
            results.forEach(result => {
                if (result) {
                    newTokens.push(result);
                }
            });

        } catch (error) {
            console.error("Failed to detect new tokens:", error);
        }

        return newTokens;
    }
};

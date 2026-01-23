
import { ethers } from 'ethers';
import { fetchTokensForNetwork, ERC20_ABI } from '../utils/tokens';

const MAX_TOKENS_TO_CHECK = 20; // Limit the number of tokens to check for performance

export const fetchEvmData = async (wallet, network) => {
    if (!wallet || !wallet.evm || !wallet.evm.address) {
        throw new Error("EVM wallet data is missing or invalid.");
    }
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);

    // 1. Fetch Native Balance
    const balanceWei = await provider.getBalance(wallet.evm.address);
    const nativeBalance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

    // 2. Fetch Token Balances from a dynamic list
    let tokenBalances = [];
    if (network.chainId) {
        const allTokens = await fetchTokensForNetwork(network.chainId);
        // Slice the list to only check the most popular tokens for performance
        const tokensToCheck = allTokens.slice(0, MAX_TOKENS_TO_CHECK);

        const tokenPromises = tokensToCheck.map(async (token) => {
            try {
                const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                const balanceRaw = await contract.balanceOf(wallet.evm.address);

                // Only include tokens with a balance greater than 0
                if (balanceRaw > 0) {
                    const balanceFormatted = ethers.formatUnits(balanceRaw, token.decimals);
                    return {
                        ...token,
                        balance: parseFloat(balanceFormatted).toFixed(4), // Use more precision for smaller balances
                    };
                }
                return null;
            } catch (error) {
                console.warn(`Could not fetch balance for ${token.symbol} (${token.address})`, error);
                return null; // Ignore tokens that cause errors
            }
        });
        
        // Filter out nulls (tokens with 0 balance or errors)
        tokenBalances = (await Promise.all(tokenPromises)).filter(Boolean);
    }

    // 3. Fetch Transaction History
    let transactions = [];
    if (network.etherscanApiUrl) {
        // Note: Some explorers might require a Pro plan for API access.
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YOUR_API_KEY_HERE';
        const url = `${network.etherscanApiUrl}?module=account&action=txlist&address=${wallet.evm.address}&sort=desc&apikey=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "1" && Array.isArray(data.result)) {
                transactions = data.result.map(tx => ({ 
                    ...tx, 
                    value: ethers.formatEther(tx.value), // Convert value from Wei to ETH
                    isOut: tx.from.toLowerCase() === wallet.evm.address.toLowerCase(),
                }));
            }
        } catch (error) {
            console.error("Failed to fetch transaction history:", error);
        }
    }

    return { nativeBalance, tokenBalances, transactions };
};


import { ethers } from 'ethers';
import { fetchTokensForNetwork, ERC20_ABI } from '../utils/tokens';

const MAX_TOKENS_TO_CHECK = 20;

export const fetchEvmData = async (wallet, network) => {
    if (!wallet || !wallet.evm || !wallet.evm.address) {
        throw new Error("EVM wallet data is missing or invalid.");
    }
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);

    // 1. Fetch Native Balance
    const balanceWei = await provider.getBalance(wallet.evm.address);
    const nativeBalance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

    // 2. Fetch Token Balances
    let tokenBalances = [];
    if (network.chainId) {
        const allTokens = await fetchTokensForNetwork(network.chainId);
        const tokensToCheck = allTokens.slice(0, MAX_TOKENS_TO_CHECK);
        const tokenPromises = tokensToCheck.map(async (token) => {
            try {
                const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                const balanceRaw = await contract.balanceOf(wallet.evm.address);
                if (balanceRaw > 0) {
                    const balanceFormatted = ethers.formatUnits(balanceRaw, token.decimals);
                    return { ...token, balance: parseFloat(balanceFormatted).toFixed(4) };
                }
                return null;
            } catch (error) {
                console.warn(`Could not fetch balance for ${token.symbol}`, error);
                return null;
            }
        });
        tokenBalances = (await Promise.all(tokenPromises)).filter(Boolean);
    }

    // 3. Fetch Transaction History (Robust Method)
    let transactions = [];
    try {
        // Primary method: Etherscan/Block Explorer API
        if (network.etherscanApiUrl) {
            const apiKey = wallet.apiKey || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YOUR_API_KEY_HERE';
            const url = `${network.etherscanApiUrl}?module=account&action=txlist&address=${wallet.evm.address}&sort=desc&apikey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "1" && Array.isArray(data.result)) {
                transactions = data.result.map(tx => ({ 
                    ...tx, 
                    value: ethers.formatEther(tx.value),
                    isOut: tx.from.toLowerCase() === wallet.evm.address.toLowerCase(),
                }));
            } else {
                console.warn('Etherscan API might have returned an error or empty list.', data.message);
            }
        }
    } catch (error) {
        console.error("Failed to fetch transaction history from Etherscan:", error);
        // Fallback or secondary logging can be placed here
    }

    return { nativeBalance, tokenBalances, transactions };
};

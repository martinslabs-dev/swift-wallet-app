
import { ethers } from 'ethers';
import { getRpcUrl } from '../utils/rpc'; // Import the new RPC utility
import { fetchTokensForNetwork, ERC20_ABI } from '../utils/tokens';
import { getMarketData } from './marketService';

const MAX_TOKENS_TO_CHECK = 20;

export const fetchEvmData = async (wallet, network) => {
    if (!wallet || !wallet.evm || !wallet.evm.address) {
        throw new Error("EVM wallet data is missing or invalid.");
    }

    const rpcUrl = getRpcUrl(network.chainId);
    if (!rpcUrl) {
        console.error(`No RPC endpoints available for network ID: ${network.chainId}`);
        throw new Error(`Could not connect to network ${network.name}. No RPC endpoints available.`);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const balanceWei = await provider.getBalance(wallet.evm.address);
    const nativeBalance = parseFloat(ethers.formatEther(balanceWei));

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
                    return { ...token, balance: parseFloat(balanceFormatted) };
                }
                return null;
            } catch (error) {
                return null;
            }
        });
        tokenBalances = (await Promise.all(tokenPromises)).filter(Boolean);
    }

    const coingeckoIds = [
        network.coingeckoId, 
        ...tokenBalances.map(token => token.coingeckoId)
    ].filter(Boolean);

    const marketData = await getMarketData(coingeckoIds);
    
    let totalValueUSD = 0;
    let totalValueYesterdayUSD = 0;

    const nativeMarketData = marketData[network.coingeckoId] || {};
    const nativePrice = nativeMarketData.usd || 0;
    const nativePriceChange = nativeMarketData.usd_24h_change || 0;
    const nativeValue = nativeBalance * nativePrice;
    totalValueUSD += nativeValue;
    const nativeValueYesterday = nativeValue / (1 + nativePriceChange / 100);
    totalValueYesterdayUSD += nativeValueYesterday;

    const enrichedTokenBalances = tokenBalances.map(token => {
        const tokenMarketData = marketData[token.coingeckoId] || {};
        const price = tokenMarketData.usd || 0;
        const priceChange = tokenMarketData.usd_24h_change || 0;
        const valueUSD = token.balance * price;
        totalValueUSD += valueUSD;
        const valueYesterday = valueUSD / (1 + priceChange / 100);
        totalValueYesterdayUSD += valueYesterday;

        return {
            ...token,
            balance: token.balance.toFixed(5),
            price: price.toFixed(2),
            value_usd: valueUSD.toFixed(2),
            price_change_24h: priceChange,
            market_cap: tokenMarketData.usd_market_cap || 0,
            volume_24h: tokenMarketData.usd_24h_vol || 0,
        };
    });
    
    const changeValue = totalValueUSD - totalValueYesterdayUSD;
    const changePercentage = totalValueYesterdayUSD > 0 ? (changeValue / totalValueYesterdayUSD) * 100 : 0;

    let transactions = [];
    try {
        if (network.etherscanApiUrl) {
            const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '6261I34WBI4V53N185U215W25P264QSXPJ';
            if (apiKey) {
                const url = `${network.etherscanApiUrl}?module=account&action=txlist&address=${wallet.evm.address}&sort=desc&apikey=${apiKey}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Etherscan API request failed with status ${response.status}`);
                }
                const data = await response.json();
                if (data.status === "1" && Array.isArray(data.result)) {
                    transactions = data.result.map(tx => ({ 
                        ...tx, 
                        value: ethers.formatEther(tx.value),
                        isOut: tx.from.toLowerCase() === wallet.evm.address.toLowerCase(),
                    }));
                } else if (data.status === "0" && data.message.includes("No transactions found")) {
                    // This is not an error, just an empty history
                    transactions = [];
                } else if (data.message) {
                    console.warn(`Etherscan API returned a non-success status: ${data.message}`);
                }
            } else {
                console.warn("Etherscan API key not found. Skipping transaction history fetch.");
            }
        }
    } catch (error) {
        console.error("Failed to fetch transaction history from Etherscan:", error);
        // Don't let a failed transaction fetch block the rest of the data
        transactions = []; // Ensure it's an array
    }

    return {
        nativeBalance: nativeBalance.toFixed(5),
        tokenBalances: enrichedTokenBalances,
        transactions, // Make sure transactions are returned
        portfolio: {
            totalValue: totalValueUSD.toFixed(2),
            value_change_24h: changeValue.toFixed(2),
            percent_change_24h: changePercentage.toFixed(2),
        }
    };
};

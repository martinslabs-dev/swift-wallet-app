
import axios from 'axios';

const SATOSHIS_PER_BTC = 100_000_000;

/**
 * Fetches Bitcoin balance and transaction data using a block explorer API.
 * 
 * @param {object} wallet The wallet object containing the bitcoin address.
 * @param {object} network The network configuration object.
 * @returns {object} An object containing the native balance, token balances (empty), and transactions.
 */
export const fetchBitcoinData = async (wallet, network) => {
    if (!wallet.bitcoin?.address) {
        console.error("Bitcoin address not found in wallet object.");
        return { nativeBalance: '0.0000', tokenBalances: [], transactions: [] };
    }

    const baseUrl = network.etherscanApiUrl;
    const address = wallet.bitcoin.address;

    try {
        // 1. Fetch Native Balance (BTC)
        const balanceResponse = await axios.get(`${baseUrl}/address/${address}`);
        const balanceSats = balanceResponse.data.chain_stats.funded_txo_sum - balanceResponse.data.chain_stats.spent_txo_sum;
        const nativeBalance = (balanceSats / SATOSHIS_PER_BTC).toFixed(8);

        // 2. Fetch Token Balances (Not applicable for Bitcoin)
        const tokenBalances = [];

        // 3. Fetch Transaction History
        const txsResponse = await axios.get(`${baseUrl}/address/${address}/txs`);
        const transactions = txsResponse.data.map(tx => {
            const valueIn = tx.vout.reduce((acc, vout) => {
                if (vout.scriptpubkey_address === address) {
                    return acc + vout.value;
                }
                return acc;
            }, 0);

            const valueOut = tx.vin.reduce((acc, vin) => {
                if (vin.prevout?.scriptpubkey_address === address) {
                    return acc + vin.prevout.value;
                }
                return acc;
            }, 0);

            const netValue = valueIn - valueOut;
            const isSender = netValue < 0;

            const fromAddress = tx.vin[0]?.prevout?.scriptpubkey_address || 'Unknown';
            const toAddress = tx.vout.find(vout => vout.scriptpubkey_address !== address)?.scriptpubkey_address || address;

            return {
                hash: tx.txid,
                from: isSender ? address : fromAddress,
                to: isSender ? toAddress : address,
                value: (Math.abs(netValue) / SATOSHIS_PER_BTC).toFixed(8),
                timeStamp: tx.status.block_time,
                status: tx.status.confirmed ? 'confirmed' : 'pending',
            };
        });

        return { nativeBalance, tokenBalances, transactions };

    } catch (error) {
        console.error("Failed to fetch Bitcoin data:", error.response ? error.response.data : error.message);
        if (error.response && (error.response.status === 404 || error.response.status === 400)) {
            return { nativeBalance: '0.00000000', tokenBalances: [], transactions: [] };
        }
        throw error;
    }
};


import axios from 'axios';

const SATOSHIS_PER_BTC = 100_000_000;

/**
 * Fetches Bitcoin balance, transactions, and UTXOs.
 */
export const fetchBitcoinData = async (wallet, network) => {
    if (!wallet.bitcoin?.address) {
        console.error("Bitcoin address not found.");
        return { nativeBalance: '0.0000', tokenBalances: [], transactions: [], utxos: [] };
    }

    const baseUrl = network.etherscanApiUrl;
    const address = wallet.bitcoin.address;

    try {
        // 1. Fetch Balance & UTXOs
        const utxosResponse = await axios.get(`${baseUrl}/address/${address}/utxo`);
        const utxos = utxosResponse.data;
        const balanceSats = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
        const nativeBalance = (balanceSats / SATOSHIS_PER_BTC).toFixed(8);

        // 2. No Token Balances for Bitcoin
        const tokenBalances = [];

        // 3. Fetch Transaction History
        const txsResponse = await axios.get(`${baseUrl}/address/${address}/txs`);
        const transactions = txsResponse.data.map(tx => {
            const valueIn = tx.vout.reduce((acc, vout) => 
                vout.scriptpubkey_address === address ? acc + vout.value : acc, 0);
            const valueOut = tx.vin.reduce((acc, vin) => 
                vin.prevout?.scriptpubkey_address === address ? acc + vin.prevout.value : acc, 0);
            
            const netValue = valueIn - valueOut;
            const isSender = netValue < 0;

            return {
                hash: tx.txid,
                from: isSender ? address : tx.vin[0]?.prevout?.scriptpubkey_address || 'N/A',
                to: isSender ? tx.vout.find(v => v.scriptpubkey_address !== address)?.scriptpubkey_address || address : address,
                value: (Math.abs(netValue) / SATOSHIS_PER_BTC).toFixed(8),
                timeStamp: tx.status.block_time,
                status: tx.status.confirmed ? 'confirmed' : 'pending',
            };
        });

        return { nativeBalance, tokenBalances, transactions, utxos };

    } catch (error) {
        console.error("Failed to fetch Bitcoin data:", error.response?.data || error.message);
        return { nativeBalance: '0.0000', tokenBalances: [], transactions: [], utxos: [] };
    }
};

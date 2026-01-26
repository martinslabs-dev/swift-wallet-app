
import axios from 'axios';

const SATOSHIS_PER_BTC = 100_000_000;

export const fetchBitcoinData = async (wallet, network) => {
    if (!wallet.bitcoin?.address) {
        console.error("Bitcoin address not found.");
        return { 
            nativeBalance: '0.0000', 
            tokenBalances: [], 
            transactions: [], 
            utxos: [],
            portfolio: { totalValue: '0.00', value_change_24h: 0, percent_change_24h: 0 } 
        };
    }

    const baseUrl = network.etherscanApiUrl;
    const address = wallet.bitcoin.address;

    try {
        const { data: utxos } = await axios.get(`${baseUrl}/address/${address}/utxo`);
        const balanceSats = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
        const nativeBalance = (balanceSats / SATOSHIS_PER_BTC).toFixed(8);

        const { data: txs } = await axios.get(`${baseUrl}/address/${address}/txs`);
        const transactions = txs.map(tx => {
            const valueIn = tx.vout.reduce((acc, vout) => 
                vout.scriptpubkey_address === address ? acc + vout.value : acc, 0);
            const valueOut = tx.vin.reduce((acc, vin) => 
                vin.prevout?.scriptpubkey_address === address ? acc + vin.prevout.value : acc, 0);
            
            const netValue = valueIn - valueOut;
            const isOut = netValue < 0;

            const toAddress = tx.vout.find(v => v.scriptpubkey_address !== address)?.scriptpubkey_address;

            return {
                hash: tx.txid,
                from: isOut ? address : tx.vin[0]?.prevout?.scriptpubkey_address || 'N/A',
                to: isOut ? toAddress || address : address,
                value: (Math.abs(netValue) / SATOSHIS_PER_BTC).toFixed(8),
                timeStamp: tx.status.block_time,
                status: tx.status.confirmed ? 'success' : 'pending',
                isOut,
            };
        });

        // Placeholder portfolio data as we don't have price feeds for BTC yet.
        const portfolio = {
            totalValue: nativeBalance, // Simple approximation
            value_change_24h: 0,
            percent_change_24h: 0,
        };

        return { nativeBalance, tokenBalances: [], transactions, utxos, portfolio };

    } catch (error) {
        console.error("Failed to fetch Bitcoin data:", error.response ? error.response.data : error.message);
        return { 
            nativeBalance: '0.0000', 
            tokenBalances: [], 
            transactions: [], 
            utxos: [],
            portfolio: { totalValue: '0.00', value_change_24h: 0, percent_change_24h: 0 } 
        };
    }
};

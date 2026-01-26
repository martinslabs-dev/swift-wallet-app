
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

export const fetchSolanaData = async (wallet, network) => {
    const connection = new Connection(network.rpcUrl, 'confirmed');

    if (!wallet.solana || !wallet.solana.address) {
        console.error("Solana address not found in wallet object.");
        return { nativeBalance: '0.00', tokenBalances: [], transactions: [], portfolio: { totalValue: '0.00', value_change_24h: 0, percent_change_24h: 0 } };
    }

    const publicKey = new PublicKey(wallet.solana.address);

    // 1. Fetch Native Balance (SOL)
    const balanceLamports = await connection.getBalance(publicKey);
    const nativeBalance = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);

    // For now, portfolio data for Solana will be minimal as we are not fetching market data yet.
    const portfolio = {
        totalValue: nativeBalance, // Placeholder, will be improved
        value_change_24h: 0,
        percent_change_24h: 0,
    };

    // 2. Fetch SPL Token Balances efficiently
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
    });

    const tokenBalances = await Promise.all(
        tokenAccounts.value.map(async ({ account }) => {
            const { mint, tokenAmount } = account.data.parsed.info;
            
            if (tokenAmount.decimals === 0 || tokenAmount.uiAmount === 0) {
                return null; // Skip tokens with 0 balance or no decimals
            }

            let tokenMetadata = { name: 'Unknown', symbol: 'N/A' };
            try {
                const mintPublicKey = new PublicKey(mint);
                const pda = await Metadata.getPDA(mintPublicKey);
                const metadata = await Metadata.load(connection, pda);
                tokenMetadata = {
                    name: metadata.data.data.name.replace(/\x00/g, ''), // Remove null characters
                    symbol: metadata.data.data.symbol.replace(/\x00/g, ''),
                };
            } catch (e) {
                console.warn(`Could not fetch metadata for mint ${mint}:`, e);
            }
            
            return {
                address: mint,
                name: tokenMetadata.name,
                symbol: tokenMetadata.symbol,
                balance: tokenAmount.uiAmountString,
                decimals: tokenAmount.decimals,
                value_usd: '0.00', // Placeholder
                price_change_24h: 0, // Placeholder
            };
        })
    );
    
    // 3. Fetch Transaction History
    const signatureInfos = await connection.getSignaturesForAddress(publicKey, { limit: 25 });
    const transactions = await Promise.all(signatureInfos.map(async (signatureInfo) => {
        try {
            const txDetails = await connection.getParsedTransaction(signatureInfo.signature, { maxSupportedTransactionVersion: 0 });
            if (!txDetails || !txDetails.blockTime) return null;

            const { transaction, meta } = txDetails;
            const isOut = transaction.message.accountKeys.some(key => key.signer && key.pubkey.equals(publicKey));
            const instruction = transaction.message.instructions[0]; 

            let from = 'Unknown';
            let to = 'Unknown';
            let value = '0';

            if (instruction.program === 'system' && instruction.parsed?.type === 'transfer') {
                from = instruction.parsed.info.source;
                to = instruction.parsed.info.destination;
                value = (instruction.parsed.info.lamports / LAMPORTS_PER_SOL).toString();
            }

            return {
                hash: signatureInfo.signature,
                from,
                to,
                value,
                timeStamp: txDetails.blockTime,
                isOut,
                status: meta?.err ? 'failed' : 'success',
                blockNumber: txDetails.slot,
            };
        } catch (error) {
            console.error(`Failed to parse transaction ${signatureInfo.signature}:`, error);
            return null;
        }
    }));

    const validTransactions = transactions.filter(t => t !== null);
    const validTokenBalances = tokenBalances.filter(t => t !== null);

    return { 
        nativeBalance, 
        tokenBalances: validTokenBalances, 
        transactions: validTransactions, 
        portfolio 
    };
};


import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

export const fetchSolanaData = async (wallet, network) => {
    const connection = new Connection(network.rpcUrl, 'confirmed');

    if (!wallet.solanaAddress) {
        console.error("Solana address not found in wallet object.");
        return { nativeBalance: '0.00', tokenBalances: [], transactions: [] };
    }

    const publicKey = new PublicKey(wallet.solanaAddress);

    // 1. Fetch Native Balance (SOL)
    const balanceLamports = await connection.getBalance(publicKey);
    const nativeBalance = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);

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
            };
        })
    );
    
    // 3. Fetch Transaction History
    const signatureInfos = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
    const transactions = await Promise.all(signatureInfos.map(async (signatureInfo) => {
        const txDetails = await connection.getParsedTransaction(signatureInfo.signature, { maxSupportedTransactionVersion: 0 });
        if (!txDetails || !txDetails.blockTime) return null; // Skip if details are missing

        // Determine transaction type and details
        const { transaction, meta } = txDetails;
        const instruction = transaction.message.instructions[0]; // Simplification: assuming one instruction

        let from = 'Unknown';
        let to = 'Unknown';
        let value = '0';
        let type = instruction.programId.toBase58(); // Default type

        if (instruction.program === 'system' && instruction.parsed?.type === 'transfer') {
            from = instruction.parsed.info.source;
            to = instruction.parsed.info.destination;
            value = (instruction.parsed.info.lamports / LAMPORTS_PER_SOL).toString();
            type = 'transfer';
        }

        return {
            hash: signatureInfo.signature,
            from: from,
            to: to,
            value: value,
            timeStamp: txDetails.blockTime,
            status: meta?.err ? 'failed' : 'success', // Simplified status
            blockNumber: txDetails.slot, // Using slot as a stand-in for block number
            type: type,
            networkId: 'solana' // Identify the network
        };
    }));

    const validTransactions = transactions.filter(t => t !== null);

    const validTokenBalances = tokenBalances.filter(t => t !== null);

    return { nativeBalance, tokenBalances: validTokenBalances, transactions: validTransactions };
};

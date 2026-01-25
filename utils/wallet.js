
import { ethers } from 'ethers';
import { getStoredWallets } from './storage';

// DISCLAIMER: This is a simplified example for demonstration purposes.
// In a real-world application, private keys should be handled with extreme care,
// preferably in a secure environment and never exposed in the front-end code.

/**
 * Signs a transaction with a given private key.
 * @param {object} transaction - The transaction object (e.g., from, to, value, data).
 * @param {string} privateKey - The private key of the account to sign with.
 * @returns {Promise<string>} The signed transaction hash.
 */
export const signTransaction = async (transaction, privateKey) => {
    // In a real wallet, you would connect to a provider here (e.g., Infura, Alchemy)
    // For this example, we'll use a mock provider.
    const provider = new ethers.providers.JsonRpcProvider(); // Connects to localhost by default
    const wallet = new ethers.Wallet(privateKey, provider);

    // Ethers.js requires some fields to be set
    const tx = {
        ...transaction,
        gasLimit: transaction.gas || 21000, // Default gas limit
        gasPrice: transaction.gasPrice || await provider.getGasPrice(),
        nonce: transaction.nonce || await wallet.getTransactionCount('latest'),
    };

    // Remove nullish values that ethers doesn't like
    Object.keys(tx).forEach(key => (tx[key] == null) && delete tx[key]);

    try {
        const signedTx = await wallet.signTransaction(tx);
        // In a real implementation, you would then send this transaction:
        // const txResponse = await provider.sendTransaction(signedTx);
        // For this demo, we'll just return the hash of the signed transaction (not the real tx hash)
        return ethers.utils.keccak256(signedTx);
    } catch (error) {
        console.error("Error signing transaction:", error);
        throw error;
    }
};

/**
 * Signs a personal message.
 * @param {string} message - The message to sign (usually hex).
 * @param {string} privateKey - The private key to sign with.
 * @returns {Promise<string>} The signature.
 */
export const signPersonalMessage = async (message, privateKey) => {
    const wallet = new ethers.Wallet(privateKey);
    // For personal_sign, the message is often expected to be a hex string.
    // Ethers' signMessage handles this by converting the string to bytes.
    try {
        const signature = await wallet.signMessage(ethers.utils.arrayify(message));
        return signature;
    } catch (error) {
        console.error("Error signing personal message:", error);
        throw error;
    }
};

/**
 * Signs typed data (EIP-712).
 * @param {object} data - The structured typed data to sign.
 * @param {string} privateKey - The private key to sign with.
 * @returns {Promise<string>} The signature.
 */
export const signTypedData = async (data, privateKey) => {
    const wallet = new ethers.Wallet(privateKey);
    const { domain, types, message } = data;

    // Ethers requires the primaryType to be in the types object.
    // If it's not, dapps might be passing a simplified structure.
    const allTypes = { ...types };
    if (!allTypes[data.primaryType]) {
        allTypes[data.primaryType] = types[Object.keys(types)[0]];
    }

    // remove the EIP712Domain type from the types object which is often included by dapps
    delete allTypes.EIP712Domain;

    try {
        const signature = await wallet._signTypedData(domain, allTypes, message);
        return signature;
    } catch (error) {
        console.error("Error signing typed data:", error);
        throw error;
    }
};

export const getWallets = async () => {
    return await getStoredWallets();
};

export const reconstructWallet = (walletData) => {
    if (walletData && walletData.privateKey && !walletData.viewOnly) {
        const evmWallet = new ethers.Wallet(walletData.privateKey);
        return {
            ...walletData,
            evmWallet,
        };
    }
    return walletData;
};


import { ethers, HDNodeWallet, Mnemonic, Wallet } from 'ethers';

const derivePath = "m/44'/60'/0'/0/";

export const deriveWalletFromMnemonic = async (mnemonic) => {
    const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), `${derivePath}0`);
    const newAccount = {
        name: 'Account 1',
        evm: { address: wallet.address, privateKey: wallet.privateKey },
        solana: null, // Placeholder for future implementation
        bitcoin: null, // Placeholder for future implementation
    };
    return {
        mnemonic,
        accounts: [newAccount],
        activeAccountIndex: 0,
        viewOnly: false,
    };
};

export const deriveWalletFromPrivateKey = (privateKey, networkId) => {
    try {
        const wallet = new Wallet(privateKey);
        const newAccount = {
            name: 'Imported Account',
            evm: { address: wallet.address, privateKey: wallet.privateKey },
            solana: null,
            bitcoin: null,
        };
        return {
            accounts: [newAccount],
            activeAccountIndex: 0,
            viewOnly: false,
        };
    } catch (e) {
        console.error("Invalid private key", e);
        return null;
    }
};

export const createViewOnlyWallet = (address, networkId) => {
    const newAccount = {
        name: 'View-Only Account',
        evm: { address: address, privateKey: null },
        solana: null,
        bitcoin: null,
    };
    return {
        accounts: [newAccount],
        activeAccountIndex: 0,
        viewOnly: true,
    };
};

export const deriveAccount = async (mnemonic, index, name) => {
    const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), `${derivePath}${index}`);
    return {
        name: name || `Account ${index + 1}`,
        evm: { address: wallet.address, privateKey: wallet.privateKey },
        solana: null,
        bitcoin: null,
    };
};

export const reconstructWallet = (walletData) => {
    // This function can be expanded to reconstruct wallet instances from stored data
    // For now, it just passes through the data as the core logic is in index.js
    return walletData;
};

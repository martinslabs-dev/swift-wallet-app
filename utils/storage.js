
import { encrypt, decrypt } from './crypto';

const getOnboardingKey = (userId) => `hasCompletedOnboarding_${userId}`;
const getWalletKey = (userId) => `encryptedWallet_${userId}`;

// Core wallet functions
const saveEncryptedWallet = async (walletData, passcode, userId) => {
    const encryptedWallet = await encrypt(walletData, passcode);
    localStorage.setItem(getWalletKey(userId), encryptedWallet);
};

const getDecryptedWallet = async (passcode, userId) => {
    const encryptedWallet = localStorage.getItem(getWalletKey(userId));
    if (!encryptedWallet) return null;
    return decrypt(encryptedWallet, passcode);
};

export const getStoredWallets = async () => {
    // This is a placeholder. In a real multi-wallet system, you would fetch all wallets.
    // For now, we'll work with the single encrypted wallet pattern already in place.
    const singleWallet = localStorage.getItem(getWalletKey('default_user')); // Or however you identify the current user
    if (singleWallet) {
        // The wallet is encrypted. We can't return the address without decrypting.
        // The context seems to expect an array of wallets with addresses.
        // This part of the logic may need rethinking depending on the app's auth flow.
        // For now, returning a structure that won't crash the app.
        return [{ address: 'Encrypted Wallet' }]; // Placeholder
    }
    return [];
};

export const storage = {
    // Onboarding status
    hasCompletedOnboarding: (userId) => !!localStorage.getItem(getOnboardingKey(userId)),
    setHasCompletedOnboarding: (userId) => localStorage.setItem(getOnboardingKey(userId), 'true'),

    // Encrypted Wallet
    saveEncryptedWallet,
    getDecryptedWallet,

    // Custom Token Management
    addCustomToken: async (token, chainId, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        if (!walletData) { return false; }
        if (!walletData.customTokens) walletData.customTokens = {};
        if (!walletData.customTokens[chainId]) walletData.customTokens[chainId] = [];
        const tokenExists = walletData.customTokens[chainId].some(t => t.address.toLowerCase() === token.address.toLowerCase());
        if (tokenExists) { return true; }
        walletData.customTokens[chainId].push(token);
        await saveEncryptedWallet(walletData, passcode, userId);
        return true;
    },
    getCustomTokens: async (chainId, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        return walletData?.customTokens?.[chainId] || [];
    },

    // Token Hiding
    hideToken: async (tokenAddress, chainId, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        if (!walletData) { return false; }
        if (!walletData.hiddenTokens) walletData.hiddenTokens = {};
        if (!walletData.hiddenTokens[chainId]) walletData.hiddenTokens[chainId] = [];
        const lowerCaseAddress = tokenAddress.toLowerCase();
        if (!walletData.hiddenTokens[chainId].includes(lowerCaseAddress)) {
            walletData.hiddenTokens[chainId].push(lowerCaseAddress);
            await saveEncryptedWallet(walletData, passcode, userId);
        }
        return true;
    },
    getHiddenTokens: async (chainId, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        return walletData?.hiddenTokens?.[chainId] || [];
    },

    // Sorting Preferences
    setSortPreference: async (preference, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        if (!walletData) { return false; }
        if (!walletData.preferences) walletData.preferences = {};
        walletData.preferences.sort = preference;
        await saveEncryptedWallet(walletData, passcode, userId);
        return true;
    },
    getSortPreference: async (userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        return walletData?.preferences?.sort || 'default'; // Default sort order
    },
    
    // Contact Management
    getContacts: async (userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        return walletData?.contacts || [];
    },
    saveContact: async (contact, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        if (!walletData) return false;
        if (!walletData.contacts) walletData.contacts = [];
        const existingIndex = walletData.contacts.findIndex(c => c.id === contact.id);
        if (existingIndex > -1) {
            walletData.contacts[existingIndex] = contact; // Update existing
        } else {
            contact.id = Date.now().toString(); // Assign a simple unique ID
            walletData.contacts.push(contact); // Add new
        }
        await saveEncryptedWallet(walletData, passcode, userId);
        return walletData.contacts;
    },
    deleteContact: async (contactId, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        if (!walletData || !walletData.contacts) return false;
        walletData.contacts = walletData.contacts.filter(c => c.id !== contactId);
        await saveEncryptedWallet(walletData, passcode, userId);
        return walletData.contacts;
    },

    // Clear all data for a user
    clearAllData: (userId) => {
        localStorage.removeItem(getOnboardingKey(userId));
        localStorage.removeItem(getWalletKey(userId));
    }
};
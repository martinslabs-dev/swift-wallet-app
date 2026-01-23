
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
        const existingIndex = walletData.contacts.findIndex(c => c.address === contact.address);
        if (existingIndex > -1) {
            walletData.contacts[existingIndex] = contact; // Update existing
        } else {
            walletData.contacts.push(contact); // Add new
        }
        await saveEncryptedWallet(walletData, passcode, userId);
        return true;
    },
    deleteContact: async (address, userId, passcode) => {
        const walletData = await getDecryptedWallet(passcode, userId);
        if (!walletData || !walletData.contacts) return false;
        walletData.contacts = walletData.contacts.filter(c => c.address !== address);
        await saveEncryptedWallet(walletData, passcode, userId);
        return true;
    },

    // Clear all data for a user
    clearAllData: (userId) => {
        localStorage.removeItem(getOnboardingKey(userId));
        localStorage.removeItem(getWalletKey(userId));
    }
};

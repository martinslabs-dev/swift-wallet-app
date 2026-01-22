
import { encrypt, decrypt } from './crypto';

const getOnboardingKey = (userId) => `hasCompletedOnboarding_${userId}`;
const getWalletKey = (userId) => `encryptedWallet_${userId}`;

export const storage = {
    // Onboarding status
    hasCompletedOnboarding: (userId) => !!localStorage.getItem(getOnboardingKey(userId)),
    setHasCompletedOnboarding: (userId) => localStorage.setItem(getOnboardingKey(userId), 'true'),

    // Encrypted Wallet
    saveEncryptedWallet: async (walletData, passcode, userId) => {
        const encryptedWallet = await encrypt(walletData, passcode);
        localStorage.setItem(getWalletKey(userId), encryptedWallet);
    },
    getDecryptedWallet: async (passcode, userId) => {
        const encryptedWallet = localStorage.getItem(getWalletKey(userId));
        if (!encryptedWallet) return null;
        return decrypt(encryptedWallet, passcode);
    },

    // Clear all data for a user
    clearAllData: (userId) => {
        localStorage.removeItem(getOnboardingKey(userId));
        localStorage.removeItem(getWalletKey(userId));
    }
};

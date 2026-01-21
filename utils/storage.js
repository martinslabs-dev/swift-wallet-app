
import { encrypt, decrypt } from './crypto';

const ONBOARDING_KEY = 'hasCompletedOnboarding';
const WALLET_KEY = 'encryptedWallet';
const WEBAUTHN_KEY = 'webauthnCredentialId';

export const storage = {
    // Onboarding status
    hasCompletedOnboarding: () => !!localStorage.getItem(ONBOARDING_KEY),
    setHasCompletedOnboarding: () => localStorage.setItem(ONBOARDING_KEY, 'true'),

    // Encrypted Wallet
    saveEncryptedWallet: async (walletData, passcode) => {
        const encryptedWallet = await encrypt(walletData, passcode);
        localStorage.setItem(WALLET_KEY, encryptedWallet);
    },
    getDecryptedWallet: async (passcode) => {
        const encryptedWallet = localStorage.getItem(WALLET_KEY);
        if (!encryptedWallet) return null;
        return decrypt(encryptedWallet, passcode);
    },

    // WebAuthn Credential ID
    getWebAuthnCredentialId: () => localStorage.getItem(WEBAUTHN_KEY),
    setWebAuthnCredentialId: (id) => localStorage.setItem(WEBAUTHN_KEY, id),

    // Clear all data
    clearAllData: () => {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(WALLET_KEY);
        localStorage.removeItem(WEBAUTHN_KEY);
    }
};

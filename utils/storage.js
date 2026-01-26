
import { AES, enc } from 'crypto-js';

const getMasterKey = (passcode, salt) => `${passcode}:${salt}`;

// --- Wallet Data ---
const getEncryptedWallet = (userId) => localStorage.getItem(`wallet_${userId}`);

const saveEncryptedWallet = async (walletData, passcode, userId) => {
    // New format: salt is stored alongside the data, not within it.
    const salt = new Date().toISOString();
    const masterKey = getMasterKey(passcode, salt);
    const encryptedData = AES.encrypt(JSON.stringify(walletData), masterKey).toString();
    
    const dataToStore = JSON.stringify({
        salt: salt,
        data: encryptedData
    });

    localStorage.setItem(`wallet_${userId}`, dataToStore);
};

const getDecryptedWallet = async (passcode, userId) => {
    const storedItem = getEncryptedWallet(userId);
    if (!storedItem) return null;

    // --- Priority 1: Try the new format (JSON object with salt and data) ---
    let parsedStoredData;
    try {
        parsedStoredData = JSON.parse(storedItem);
    } catch (e) {
        // It's not a JSON object, so it must be the old, raw encrypted format.
        // We'll proceed to the fallback logic below.
    }

    if (parsedStoredData && parsedStoredData.salt && parsedStoredData.data) {
        try {
            const masterKey = getMasterKey(passcode, parsedStoredData.salt);
            const decryptedBytes = AES.decrypt(parsedStoredData.data, masterKey);
            const decryptedString = decryptedBytes.toString(enc.Utf8);

            // If decryption fails, decryptedString will be empty, and JSON.parse will throw an error.
            // This is our primary validation check.
            const walletData = JSON.parse(decryptedString);
            return walletData; // SUCCESS with new format

        } catch (e) {
            // Decryption with new format failed. This is the expected path for a wrong password.
            return null;
        }
    }

    // --- Priority 2: Fallback for the old, unsalted format ---
    try {
        const decryptedBytes = AES.decrypt(storedItem, passcode);
        const decryptedString = decryptedBytes.toString(enc.Utf8);

        // The same validation applies here. If decryption fails, this will throw.
        const walletData = JSON.parse(decryptedString);

        // If we successfully decrypt, it's a valid old-format wallet. 
        // We should immediately upgrade it to the new, more secure format.
        await saveEncryptedWallet(walletData, passcode, userId);
        return walletData; // SUCCESS with old format

    } catch (e) {
        // If we reach here, it means the data was not in the new format, and it also failed
        // to decrypt as the old format. This is a definitive failure.
        console.error("Decryption failed for all known formats. Incorrect password or corrupted data.");
        return null;
    }
};



// --- Custom Tokens ---
const getCustomTokensKey = (chainId, userId) => `custom_tokens_${chainId}_${userId}`;
const getCustomTokens = async (chainId, userId, passcode) => {
    const key = getCustomTokensKey(chainId, userId);
    const encryptedTokens = localStorage.getItem(key);
    if (!encryptedTokens) return [];
    try {
        const decrypted = AES.decrypt(encryptedTokens, passcode).toString(enc.Utf8);
        return JSON.parse(decrypted);
    } catch (e) {
        return [];
    }
};
const addCustomToken = async (token, chainId, userId, passcode) => {
    const tokens = await getCustomTokens(chainId, userId, passcode);
    if (!tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
        tokens.push(token);
        const key = getCustomTokensKey(chainId, userId);
        const encrypted = AES.encrypt(JSON.stringify(tokens), passcode).toString();
        localStorage.setItem(key, encrypted);
    }
};

// --- Hidden Tokens ---
const getHiddenTokensKey = (chainId, userId) => `hidden_tokens_${chainId}_${userId}`;
const getHiddenTokens = async (chainId, userId, passcode) => {
    const key = getHiddenTokensKey(chainId, userId);
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return [];
    try {
        return JSON.parse(AES.decrypt(encrypted, passcode).toString(enc.Utf8));
    } catch (e) { return []; }
};
const setHiddenTokens = async (tokens, chainId, userId, passcode) => {
    const key = getHiddenTokensKey(chainId, userId);
    const encrypted = AES.encrypt(JSON.stringify(tokens), passcode).toString();
    localStorage.setItem(key, encrypted);
};

// --- Sort Preference ---
const getSortPreferenceKey = (userId) => `sort_pref_${userId}`;
const getSortPreference = async (userId, passcode) => {
    const key = getSortPreferenceKey(userId);
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return 'default';
    try {
        return AES.decrypt(encrypted, passcode).toString(enc.Utf8);
    } catch { return 'default'; }
};
const setSortPreference = async (sort, userId, passcode) => {
    const key = getSortPreferenceKey(userId);
    const encrypted = AES.encrypt(sort, passcode).toString();
    localStorage.setItem(key, encrypted);
};

// --- Generic & Control ---
const hasCompletedOnboarding = (userId) => localStorage.getItem(`onboarded_${userId}`) === 'true';
const setHasCompletedOnboarding = (userId) => localStorage.setItem(`onboarded_${userId}`, 'true');
const clearAllData = (userId) => {
    Object.keys(localStorage).forEach(key => {
        if (key.endsWith(`_${userId}`)) {
            localStorage.removeItem(key);
        }
    });
    localStorage.removeItem(`onboarded_${userId}`); // Also clear onboarding status
};

export const storage = {
    getEncryptedWallet,
    saveEncryptedWallet,
    getDecryptedWallet,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    getCustomTokens,
    addCustomToken,
    getHiddenTokens,
    setHiddenTokens, 
    getSortPreference,
    setSortPreference,
    clearAllData,
};
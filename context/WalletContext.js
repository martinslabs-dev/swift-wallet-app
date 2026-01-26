
import React, { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
    const [decryptedWallet, setDecryptedWallet] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [sessionPasscode, setSessionPasscode] = useState(null);
    const [userId, setUserId] = useState(null);

    const unlock = async (passcode, userId) => {
        const walletData = await storage.getDecryptedWallet(passcode, userId);
        if (walletData) {
            setDecryptedWallet(walletData);
            setSessionPasscode(passcode);
            setIsUnlocked(true);
            return true;
        }
        return false;
    };

    const lock = () => {
        setDecryptedWallet(null);
        setSessionPasscode(null);
        setIsUnlocked(false);
    };

    const value = {
        decryptedWallet,
        isUnlocked,
        sessionPasscode,
        userId,
        setUserId,
        unlock,
        lock,
        accounts: decryptedWallet ? decryptedWallet.accounts : [],
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

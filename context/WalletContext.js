
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWallets } from '../utils/wallet'; 

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWallets = async () => {
            try {
                const wallets = await getWallets();
                // Assuming getWallets returns an array of wallet objects with an address property
                setAccounts(wallets.map(w => ({ address: w.address, ...w })));
            } catch (error) {
                console.error("Failed to load wallets:", error);
            }
            setLoading(false);
        };

        loadWallets();
    }, []);

    const value = { accounts, loading };

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

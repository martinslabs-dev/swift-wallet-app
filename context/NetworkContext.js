
import React, { createContext, useState, useContext, useMemo } from 'react';
import { NETWORKS } from '../utils/networks';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    const [activeNetwork, setActiveNetwork] = useState(NETWORKS.sepolia);

    const switchNetwork = (networkId) => {
        const newNetwork = NETWORKS[networkId];
        if (newNetwork) {
            setActiveNetwork(newNetwork);
        }
    };

    const value = useMemo(() => ({
        activeNetwork,
        switchNetwork,
        availableNetworks: NETWORKS,
    }), [activeNetwork]);

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};

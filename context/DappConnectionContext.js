
import React, { createContext, useContext, useState, useCallback } from 'react';

const DappConnectionContext = createContext(null);

export const DappConnectionProvider = ({ children }) => {
    // Stores connections as { [origin]: { accounts: [...] } }
    const [connections, setConnections] = useState({});

    const connect = useCallback((origin, accounts) => {
        console.log(`Connecting to ${origin} with accounts:`, accounts);
        setConnections(prev => ({ ...prev, [origin]: { accounts } }));
    }, []);

    const disconnect = useCallback((origin) => {
        console.log(`Disconnecting from ${origin}`);
        setConnections(prev => {
            const newConnections = { ...prev };
            delete newConnections[origin];
            return newConnections;
        });
    }, []);

    const getConnection = useCallback((origin) => {
        return connections[origin];
    }, [connections]);

    const value = {
        connections,
        connect,
        disconnect,
        getConnection,
    };

    return (
        <DappConnectionContext.Provider value={value}>
            {children}
        </DappConnectionContext.Provider>
    );
};

export const useDappConnection = () => {
    const context = useContext(DappConnectionContext);
    if (!context) {
        throw new Error('useDappConnection must be used within a DappConnectionProvider');
    }
    return context;
};

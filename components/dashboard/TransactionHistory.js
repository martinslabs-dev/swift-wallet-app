
import React from 'react';
import TransactionItem from './TransactionItem';

const TransactionHistory = ({ transactions, currentUserAddress, network }) => { // Add network prop
    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map(tx => (
                <TransactionItem 
                    key={tx.hash} 
                    tx={tx} 
                    currentUserAddress={currentUserAddress} 
                    network={network} // Pass network down
                />
            ))}
        </div>
    );
};

export default TransactionHistory;

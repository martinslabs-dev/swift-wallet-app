
import React from 'react';
import TransactionItem from './TransactionItem';
import { motion } from 'framer-motion';

const TransactionHistory = ({ transactions, currentUserAddress, network, searchTerm, isLoading, error }) => {

    // The text highlighter can be kept if you intend to use a search bar later,
    // otherwise, it can be removed for simplification.
    const highlightText = (text, highlight) => {
        if (!highlight || !text) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <>
                {parts.map((part, i) => 
                    part.toLowerCase() === highlight.toLowerCase() ? 
                    <span key={i} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">{part}</span> : 
                    part
                )}
            </>
        );
    };

    if (isLoading) {
        return <p className="text-center py-8 text-gray-500 dark:text-gray-400">Loading transactions...</p>;
    }

    if (error) {
        return <p className="text-center py-8 text-red-500">Failed to load transaction history.</p>;
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No transactions have been recorded.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ staggerChildren: 0.07 }}
        >
            {transactions.map((tx) => (
                <TransactionItem 
                    key={tx.hash}
                    tx={tx} 
                    currentUserAddress={currentUserAddress} 
                    network={network}
                    highlightText={(text) => highlightText(text, searchTerm)}
                />
            ))}
        </motion.div>
    );
};

export default TransactionHistory;

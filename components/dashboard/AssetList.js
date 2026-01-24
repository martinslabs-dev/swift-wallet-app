
import React from 'react';
import AssetListItem from './AssetListItem';
import { AnimatePresence, motion } from 'framer-motion';

const AssetList = ({ tokens, onHideToken, onTokenClick, isLoading, error }) => {
    if (isLoading && (!tokens || tokens.length === 0)) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Loading tokens...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>Error loading tokens.</p>
            </div>
        );
    }

    if (!tokens || tokens.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">You have no tokens on this network.</p>
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
            <AnimatePresence>
                {tokens.map((token) => (
                    <AssetListItem 
                        key={token.address || token.symbol}
                        token={token} 
                        onHideToken={onHideToken} 
                        onTokenClick={onTokenClick}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default AssetList;

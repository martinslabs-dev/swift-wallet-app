
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenList from './TokenList';
import TransactionHistory from './TransactionHistory';
import NftGallery from './NftGallery';

const AssetTabs = ({ 
    tokens, 
    transactions, 
    onTokenClick, 
    onTransactionClick,
    onImportToken,
    onManageTokens,
    network,
    currentUserAddress,
    isLoading,
    error,
}) => {
    const [activeTab, setActiveTab] = useState('tokens');

    const tabs = useMemo(() => [
        { id: 'tokens', label: 'Tokens' },
        { id: 'nfts', label: 'NFTs' },
        { id: 'activity', label: 'Activity' },
    ], []);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <div className="glass-card p-4 sm:p-6">
            <div className="bg-slate-900/60 rounded-lg p-1 flex space-x-1 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative w-full rounded-md py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors focus:outline-none`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-tab-indicator"
                                className="absolute inset-0 bg-slate-700/80 rounded-md shadow-md"
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            />
                        )}
                        <span className={`relative z-10 ${activeTab === tab.id ? 'theme-gradient-text' : ''}`}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {activeTab === 'tokens' && (
                        <TokenList 
                            tokens={tokens} 
                            onTokenClick={onTokenClick} 
                            onManageTokens={onManageTokens}
                            network={network}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}
                    {activeTab === 'nfts' && <NftGallery ownerAddress={currentUserAddress} />}
                    {activeTab === 'activity' && <TransactionHistory transactions={transactions} onTransactionClick={onTransactionClick} currentUserAddress={currentUserAddress} network={network} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AssetTabs;

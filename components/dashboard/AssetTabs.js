
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiChevronDown } from 'react-icons/fi';
import AssetList from './AssetList';
import TransactionHistory from './TransactionHistory';

const AssetTabs = ({ 
    tokens, 
    transactions, 
    onTokenClick, 
    onImportToken, 
    network, 
    onSortChange, 
    currentSort, 
    onHideToken,
    currentUserAddress,
    isLoading,
    error
}) => {
    const [activeTab, setActiveTab] = useState('tokens');

    const tabs = [
        { id: 'tokens', label: 'Tokens' },
        { id: 'activity', label: 'Activity' },
    ];

    const contentVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeInOut' } }
    };

    return (
        <div className="glass-card p-4 sm:p-6">
            {/* Tab Navigation */}
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
                        <span className="relative z-10">
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="min-h-[300px]"
                >
                    {activeTab === 'tokens' && (
                        <div>
                             <div className="flex justify-between items-center mb-4 px-1">
                                <button onClick={onImportToken} className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    <FiPlus size={16} />
                                    <span>Import Token</span>
                                </button>
                                <button onClick={onSortChange} className="flex items-center space-x-1 text-sm text-slate-300 hover:text-white transition-colors">
                                    <span>{currentSort}</span>
                                    <FiChevronDown size={14}/>
                                </button>
                            </div>
                            <AssetList
                                tokens={tokens}
                                onTokenClick={onTokenClick}
                                onHideToken={onHideToken}
                            />
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <div>
                            <TransactionHistory 
                                transactions={transactions.slice(0, 20)} 
                                currentUserAddress={currentUserAddress} 
                                network={network} 
                            />
                            {isLoading && transactions.length === 0 && <p className="text-center text-slate-400 mt-4">Loading activity...</p>}
                            {error && <p className="text-center text-red-400 mt-4">{error}</p>}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AssetTabs;

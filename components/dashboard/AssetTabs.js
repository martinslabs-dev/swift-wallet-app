
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiChevronDown } from 'react-icons/fi';
import AssetList from './AssetList';
import TransactionHistory from './TransactionHistory';
import TransactionFilter from './TransactionFilter'; // Import filter component

const AssetTabs = ({ 
    tokens, 
    transactions, 
    onTokenClick, 
    onTransactionClick, // <-- Receive prop
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
    const [filters, setFilters] = useState({
        term: '',
        status: 'all',
        type: 'all',
    });

    const tabs = [
        { id: 'tokens', label: 'Tokens' },
        { id: 'activity', label: 'Activity' },
    ];

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const { term, status, type } = filters;
            if (status !== 'all' && tx.status?.toLowerCase() !== status) {
                return false;
            }
            if (type !== 'all' && tx.type?.toLowerCase() !== type) {
                return false;
            }
            if (term) {
                const searchTerm = term.toLowerCase();
                const inAddress = tx.recipient?.toLowerCase().includes(searchTerm) || tx.sender?.toLowerCase().includes(searchTerm);
                const inAmount = tx.amount?.toString().toLowerCase().includes(searchTerm);
                if (!inAddress && !inAmount) {
                    return false;
                }
            }
            return true;
        });
    }, [transactions, filters]);


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
                                <div className="relative">
                                    <select 
                                        onChange={(e) => onSortChange(e.target.value)} 
                                        value={currentSort}
                                        className="bg-slate-800/60 border border-slate-700 rounded-md py-1 pl-3 pr-8 text-sm text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="default">Default Sort</option>
                                        <option value="value_desc">Sort by Value</option>
                                        <option value="name_asc">Sort by Name (A-Z)</option>
                                        <option value="name_desc">Sort by Name (Z-A)</option>
                                    </select>
                                    <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                                </div>
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
                            <TransactionFilter onFilterChange={handleFilterChange} />
                            <TransactionHistory
                                transactions={filteredTransactions.slice(0, 20)}
                                onTransactionClick={onTransactionClick} // Pass down
                                currentUserAddress={currentUserAddress}
                                network={network}
                            />
                            {isLoading && transactions.length === 0 && <p className="text-center text-slate-400 mt-4">Loading activity...</p>}
                            {!isLoading && filteredTransactions.length === 0 && <p className="text-center text-slate-400 mt-8">No matching transactions found.</p>}
                            {error && <p className="text-center text-red-400 mt-4">{error}</p>}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AssetTabs;

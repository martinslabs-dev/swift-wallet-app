
import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';
import TransactionHistory from './TransactionHistory';
import AssetList from './AssetList';
import ActionButtons from './ActionButtons'; // Import the new component

const MainDashboard = ({ 
    wallet, 
    balance, 
    tokenBalances, 
    transactions, 
    isLoading, 
    error, 
    onSend, 
    onReceive,
    onSwap, // Add onSwap prop
    onImportToken,
    network,
    onRefreshData,
    onSortChange,
    currentSort,
    onHideToken
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (wallet?.address) {
            navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto p-4 pt-0"
        >
            {/* Main Balance Card */}
            <div className="glass-card p-6 text-white mb-6">
                <div className="text-center mb-6">
                    <p className="text-gray-400 text-lg">Total Balance ({network.currencySymbol})</p>
                    {isLoading && transactions.length === 0 ? (
                        <div className="h-12 w-3/4 bg-gray-700/50 animate-pulse mx-auto mt-2 rounded-md"></div>
                    ) : (
                        <h1 className="text-5xl font-bold tracking-tighter">{balance}</h1>
                    )}
                </div>

                {/* Use the new ActionButtons component */}
                <ActionButtons onSend={onSend} onReceive={onReceive} onSwap={onSwap} />

                <div className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between text-sm">
                    <p className="font-mono truncate pr-4">{wallet.address}</p>
                    <button onClick={handleCopy} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        {copied ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
                    </button>
                </div>
            </div>

            {/* Token List */}
            <div className="glass-card p-6 text-white mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">My Tokens</h2>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={onImportToken} 
                            className="text-xs bg-purple-600/50 hover:bg-purple-500/50 text-white font-semibold py-1 px-2 rounded-md transition-colors"
                        >
                            Import
                        </button>
                        <select 
                            value={currentSort} 
                            onChange={(e) => onSortChange(e.target.value)}
                            className="bg-gray-800 border-none text-white text-xs rounded-md focus:ring-purple-500 focus:border-purple-500 py-1 pl-2 pr-6 appearance-none"
                        >
                            <option value="default">Sort by Default</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="value_desc">Value (High-Low)</option>
                        </select>
                    </div>
                </div>

                {isLoading && tokenBalances.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-700/50 animate-pulse rounded-lg"></div>
                        <div className="h-16 bg-gray-700/50 animate-pulse rounded-lg"></div>
                    </div>
                ) : (
                    <AssetList tokens={tokenBalances} onHideToken={onHideToken} />
                )}
            </div>

            {/* Transaction History Card */}
            <div className="glass-card p-6 text-white">
                 <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                 {isLoading && transactions.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-gray-400">Loading history...</p>
                    </div>
                ) : error ? (
                     <div className="text-center py-4 text-red-400">
                        <p>{error}</p>
                    </div>
                ) : (
                    <TransactionHistory 
                        transactions={transactions} 
                        currentUserAddress={wallet.address} 
                        network={network} 
                    />
                )}
            </div>

        </motion.div>
    );
};

export default MainDashboard;

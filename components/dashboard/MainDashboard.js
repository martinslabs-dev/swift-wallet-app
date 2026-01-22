
import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheckCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import TransactionHistory from './TransactionHistory';
import AssetList from './AssetList';

const MainDashboard = ({ 
    wallet, 
    balance, 
    tokenBalances, 
    transactions, 
    isLoading, 
    error, 
    onSend, 
    onReceive, 
    network,
    onRefreshData // Prop for refreshing data, will be used later
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

                <div className="flex justify-center gap-4 mb-6">
                    <button onClick={onSend} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors duration-300">
                        <FiArrowUp /> Send
                    </button>
                    <button onClick={onReceive} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors duration-300">
                        <FiArrowDown /> Receive
                    </button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between text-sm">
                    <p className="font-mono truncate pr-4">{wallet.address}</p>
                    <button onClick={handleCopy} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        {copied ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
                    </button>
                </div>
            </div>

            {/* Token List */}
            <div className="glass-card p-6 text-white mb-6">
                <h2 className="text-xl font-bold mb-4">My Tokens</h2>
                {isLoading && tokenBalances.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-700/50 animate-pulse rounded-lg"></div>
                        <div className="h-16 bg-gray-700/50 animate-pulse rounded-lg"></div>
                    </div>
                ) : (
                    <AssetList tokens={tokenBalances} />
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


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';
import ActionButtons from './ActionButtons';
import AssetTabs from './AssetTabs';

const MainDashboard = ({
    wallet,
    portfolio,
    tokenBalances,
    transactions,
    isLoading,
    error,
    onSend,
    onReceive,
    onSwap,
    onImportToken,
    onTokenClick,
    network,
    onSortChange,
    currentSort,
    onHideToken,
    isViewOnly, // <-- New prop
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (wallet?.address) {
            navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl mx-auto p-4 md:p-6"
        >
            <motion.div variants={itemVariants} className="glass-card p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className='text-center md:text-left mb-4 md:mb-0'>
                        <h2 className="text-lg font-medium text-slate-300 mb-1">Total Balance</h2>
                        <p className="text-5xl font-bold theme-gradient-text tracking-tight">
                            ${portfolio.totalValue ? parseFloat(portfolio.totalValue).toFixed(2) : '0.00'}
                        </p>
                    </div>
                    <div
                        onClick={handleCopy}
                        className="flex items-center space-x-3 bg-slate-800/60 p-3 rounded-full cursor-pointer hover:bg-slate-700/80 transition-colors border border-slate-700"
                    >
                        <span className="text-sm font-mono text-slate-300 truncate max-w-[150px] md:max-w-[200px]">{wallet.address}</span>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            {copied ? <FiCheckCircle className="text-cyan-400" /> : <FiCopy />}
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
                <ActionButtons onSend={onSend} onReceive={onReceive} onSwap={onSwap} isViewOnly={isViewOnly} />
            </motion.div>

            <motion.div variants={itemVariants}>
                <AssetTabs
                    tokens={tokenBalances}
                    transactions={transactions}
                    onTokenClick={onTokenClick}
                    onImportToken={onImportToken}
                    network={network}
                    onSortChange={onSortChange}
                    currentSort={currentSort}
                    onHideToken={onHideToken}
                    currentUserAddress={wallet.address}
                    isLoading={isLoading}
                    error={error}
                />
            </motion.div>
        </motion.div>
    );
};

export default MainDashboard;

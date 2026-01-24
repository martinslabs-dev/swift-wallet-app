
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';
import ActionButton from '../ui/ActionButton';

const BalanceCard = ({ wallet, portfolio, onSend, onReceive, onSwap }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (wallet?.address) {
            navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <motion.div 
                className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="mb-5">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</h2>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">${portfolio.totalValue || '0.00'}</p>
                </div>

                <div 
                    onClick={handleCopy}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 cursor-pointer group mb-6"
                >
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                        {wallet.address}
                    </span>
                    <button className="ml-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {copied ? <FiCheckCircle /> : <FiCopy />}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <ActionButton onClick={onSend} label="Send" />
                    <ActionButton onClick={onReceive} label="Receive" />
                    <ActionButton onClick={onSwap} label="Swap" />
                </div>
            </motion.div>
        </div>
    );
};

export default BalanceCard;

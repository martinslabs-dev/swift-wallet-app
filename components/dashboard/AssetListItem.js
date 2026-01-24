
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';

const GenericTokenIcon = ({ symbol }) => (
    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
        <span className="text-sm font-bold theme-gradient-text">
            {symbol?.charAt(0).toUpperCase() || '?'}
        </span>
    </div>
);

const AssetListItem = ({ token, onTokenClick }) => {
    const hasSignificantBalance = parseFloat(token.balance) > 0.00001;
    const priceChange = token.price_change_24h || 0;
    const isPositiveChange = priceChange >= 0;
    const changeColor = isPositiveChange ? 'text-green-400' : 'text-red-400';

    const handleItemClick = () => {
        if (onTokenClick) {
            onTokenClick(token);
        }
    };

    const itemVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } },
        exit: { opacity: 0, x: -30, transition: { duration: 0.2, ease: 'easeIn' } }
    };

    const formattedBalance = hasSignificantBalance ? parseFloat(token.balance).toFixed(5) : '0';
    const formattedUsdValue = token.value_usd ? parseFloat(token.value_usd).toFixed(2) : '0.00';

    return (
        <motion.div
            layout
            variants={itemVariants}
            onClick={handleItemClick}
            className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-200 cursor-pointer bg-slate-900/40 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/80 ${!hasSignificantBalance ? 'opacity-60' : ''}`}
            whileHover={{ scale: 1.02 }}
        >
            {/* Token Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {token.logoURI ? (
                    <Image
                        src={token.logoURI}
                        alt={`${token.name} logo`}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <GenericTokenIcon symbol={token.symbol} />
                )}
                <div className="min-w-0">
                    <p className="font-semibold text-base text-slate-100 truncate">{token.name}</p>
                    <p className="text-sm text-slate-400">{token.symbol}</p>
                </div>
            </div>

            {/* Balance and Value */}
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                    <p className="font-medium text-slate-100">{formattedBalance}</p>
                    <p className="text-sm text-slate-400">${formattedUsdValue}</p>
                </div>
                
                <div className="text-right w-20 hidden sm:block">
                     <p className={`font-medium ${changeColor}`}>
                        {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%
                    </p>
                </div>

                <div className="text-slate-500">
                    <FiChevronRight size={20} />
                </div>
            </div>
        </motion.div>
    );
};

export default AssetListItem;

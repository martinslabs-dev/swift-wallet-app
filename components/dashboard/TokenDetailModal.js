
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';
import PriceChart from './PriceChart'; // Import the PriceChart component

const GenericTokenIcon = ({ symbol }) => (
    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-lg">
        {symbol?.charAt(0).toUpperCase() || '?'}
    </div>
);

const TokenDetailModal = ({ token, onClose }) => {
    if (!token) return null;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: "0%", opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 150 } },
        exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
    };
    
    const formatMarketData = (value) => {
        if (typeof value !== 'number') return 'N/A';
        return `$${value.toLocaleString('en-US')}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end z-50"
                onClick={onClose}
            >
                <motion.div
                    key="modal"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="glass-card-darker w-full max-w-md rounded-t-2xl p-6 text-white" 
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {token.logoURI ? (
                                <Image src={token.logoURI} alt={token.name} width={48} height={48} className="rounded-full"/>
                            ) : (
                                <GenericTokenIcon symbol={token.symbol} />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold">{token.name}</h2>
                                <p className="text-gray-400">{token.symbol}</p>
                            </div>
                        </div>
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Balance & Price Info */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-400">Balance</span>
                            <span className="font-bold">{token.balance}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-lg">
                            <span className="text-gray-400">Value</span>
                            <span className="font-bold">${token.value_usd}</span>
                        </div>
                         <div className="flex justify-between items-center mt-2 text-sm">
                            <span className="text-gray-400">Price</span>
                            <span className='font-mono'>${token.price}</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-48 rounded-lg mb-6 flex items-center justify-center">
                        <PriceChart tokenId={token.id} />
                    </div>
                    
                    {/* Market Stats */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">Market Stats</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Market Cap</span>
                                <span>{formatMarketData(token.market_cap)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">24h Volume</span>
                                <span>{formatMarketData(token.volume_24h)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-400">24h Change</span>
                                <span className={token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {token.price_change_24h.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TokenDetailModal;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiCheck, FiChevronDown } from 'react-icons/fi';

const NetworkSelector = ({ currentNetwork, networks, onSelectNetwork }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (network) => {
        onSelectNetwork(network);
        setIsOpen(false);
    };

    if (!currentNetwork || !networks) {
        return null;
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-full bg-gray-800/60 hover:bg-gray-700/80 transition-colors duration-300"
            >
                <FiGlobe className="text-gray-400" />
                <span>{currentNetwork.name}</span>
                <FiChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute top-full right-0 mt-2 w-64 glass-card p-2 z-50"
                    >
                        <div className="space-y-1">
                            <p className="text-gray-400 text-xs font-bold uppercase px-3 pt-2 pb-1">Select Network</p>
                            {networks.map(network => (
                                <button
                                    key={network.id}
                                    onClick={() => handleSelect(network)}
                                    className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-gray-700/70 transition-colors"
                                >
                                    <span className="text-white">{network.name}</span>
                                    {currentNetwork.id === network.id && (
                                        <FiCheck className="text-green-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NetworkSelector;

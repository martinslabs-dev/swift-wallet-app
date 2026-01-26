import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiSearch } from 'react-icons/fi';
import { PREDEFINED_TOKENS } from '../../utils/tokens'; 

const ManageTokensScreen = ({
    onClose,
    onImportToken,
    visibleTokens,
    onToggleToken,
    network,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTokens = useMemo(() => {
        if (!network || !network.chainId) return [];
        const networkTokens = PREDEFINED_TOKENS[network.chainId] || [];
        if (!searchTerm) {
            return networkTokens;
        }
        return networkTokens.filter(token =>
            token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, network]);

    const isTokenVisible = (tokenAddress) => {
        return visibleTokens.some(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-gray-900 z-50 flex flex-col"
        >
            <header className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-md">
                <button onClick={onClose} className="p-2">
                    <FiArrowLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">Manage Crypto</h1>
                <button onClick={onImportToken} className="p-2">
                    <FiPlus className="w-6 h-6 text-white" />
                </button>
            </header>

            <div className="p-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredTokens.map(token => (
                    <div key={token.address} className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center">
                            <img src={token.logoURI} alt={token.name} className="w-8 h-8 mr-4" />
                            <div>
                                <h3 className="text-white font-semibold">{token.symbol}</h3>
                                <p className="text-gray-400 text-sm">{token.name}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isTokenVisible(token.address)}
                                onChange={() => onToggleToken(token)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ManageTokensScreen;


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiPlus, FiLoader } from 'react-icons/fi';
import { ethers } from 'ethers';
import { ERC20_ABI } from '../../utils/tokens';
import { storage } from '../../utils/storage';

const ImportToken = ({ onClose, onTokenImported, chainId, userId, passcode, provider }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenDetails, setTokenDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tokenAddress.length < 42) {
            setTokenDetails(null);
            setError('');
            return;
        }

        const fetchTokenDetails = async () => {
            if (ethers.isAddress(tokenAddress)) {
                setIsLoading(true);
                setError('');
                try {
                    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                    const [name, symbol, decimals] = await Promise.all([
                        contract.name(),
                        contract.symbol(),
                        contract.decimals()
                    ]);
                    setTokenDetails({ address: tokenAddress, name, symbol, decimals: Number(decimals) });
                } catch (err) {
                    console.error("Error fetching token details:", err);
                    setError('Could not fetch token details. Please ensure the address is correct and on the right network.');
                    setTokenDetails(null);
                }
                setIsLoading(false);
            }
        };

        const handler = setTimeout(() => {
            fetchTokenDetails();
        }, 500);

        return () => clearTimeout(handler);

    }, [tokenAddress, provider]);

    const handleImport = async () => {
        if (!tokenDetails) return;
        try {
            await storage.addCustomToken(tokenDetails, chainId, userId, passcode);
            onTokenImported();
            onClose();
        } catch (err) {
            setError('Failed to save custom token.');
            console.error(err);
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-700/50"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Import Token</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">Token Contract Address</label>
                        <div className="relative">
                             <input 
                                type="text"
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                                placeholder="0x..."
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                            />
                            {isLoading && <FiLoader className='animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' />}
                        </div>
                       
                    </div>
                    
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                    {tokenDetails && (
                        <div className='bg-gray-800/70 p-4 rounded-lg space-y-2 border border-gray-700/50'>
                            <p className='text-gray-400'>Token Symbol: <span className='font-bold text-white'>{tokenDetails.symbol}</span></p>
                            <p className='text-gray-400'>Token Name: <span className='font-bold text-white'>{tokenDetails.name}</span></p>
                            <p className='text-gray-400'>Decimals: <span className='font-bold text-white'>{tokenDetails.decimals}</span></p>
                        </div>
                    )}

                </div>

                <div className="mt-8 flex justify-end">
                    <motion.button
                        onClick={handleImport}
                        disabled={!tokenDetails || isLoading}
                        className="flex items-center justify-center gap-2 bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 disabled:shadow-none"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiPlus />
                        Import
                    </motion.button>
                </div>

            </motion.div>
        </motion.div>
    );
};

export default ImportToken;

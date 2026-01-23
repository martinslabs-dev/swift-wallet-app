
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchTokenDetails } from '../utils/tokens';
import { storage } from '../utils/storage';
import { FaSpinner } from 'react-icons/fa';

const ImportToken = ({ onTokenImported, onClose, chainId, userId, passcode, provider }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [foundToken, setFoundToken] = useState(null);

    const handleSearch = useCallback(async () => {
        if (!tokenAddress || !provider) {
            setError('Please enter a valid token address.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setFoundToken(null);

        try {
            const details = await fetchTokenDetails(tokenAddress, provider);
            if (details) {
                setFoundToken(details);
            } else {
                setError('Could not find a valid ERC-20 token at this address.');
            }
        } catch (e) {
            setError('An error occurred while searching for the token.');
            console.error(e);
        }
        setIsLoading(false);
    }, [tokenAddress, provider]);

    const handleImport = async () => {
        if (!foundToken) return;

        setIsLoading(true);
        const success = await storage.addCustomToken(foundToken, chainId, userId, passcode);
        setIsLoading(false);

        if (success) {
            onTokenImported(foundToken); // Notify parent to refresh list
            onClose(); // Close the modal
        } else {
            setError('Failed to save the custom token. It might already exist.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            >
                <h2 className="text-2xl font-bold text-white mb-4">Import Token</h2>
                <p className="text-gray-400 mb-6">Enter the contract address of the token you want to import.</p>

                <div className="space-y-4">
                    <input
                        type="text"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        onBlur={handleSearch} // Auto-search when user clicks away
                        placeholder="0x..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    {isLoading && <FaSpinner className="animate-spin text-purple-400 mx-auto" size={24} />}
                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    {foundToken && (
                        <div className="bg-gray-700 p-4 rounded-md space-y-2">
                            <p className="text-white"><span className="font-bold">Name:</span> {foundToken.name}</p>
                            <p className="text-white"><span className="font-bold">Symbol:</span> {foundToken.symbol}</p>
                            <p className="text-white"><span className="font-bold">Decimals:</span> {foundToken.decimals}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!foundToken || isLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Import
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ImportToken;

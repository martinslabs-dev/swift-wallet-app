
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BackArrow from './icons/BackArrow'; // Corrected import
import { NETWORKS } from '../../utils/networks'; 

const ImportFromPrivateKey = ({ onPrivateKeySubmit, onBack }) => {
    const [privateKey, setPrivateKey] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('mainnet');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (privateKey.trim()) {
            onPrivateKeySubmit(privateKey.trim(), selectedNetwork);
        } else {
            setError('Private key cannot be empty.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md mx-auto p-6 md:p-8"
        >
            <motion.div variants={itemVariants} className="relative flex items-center justify-center mb-8">
                <motion.button 
                    onClick={onBack} 
                    className="absolute left-0 text-slate-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <BackArrow />
                </motion.button>
                <h1 className="text-3xl font-bold text-white text-center ml-10 mr-10">Import Private Key</h1>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center text-slate-400 mb-8">
                <p>Enter your private key and select the network.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
                <div className="w-full">
                    <label htmlFor="network-select" className="block text-sm font-medium text-slate-300 mb-2">Network</label>
                    <select
                        id="network-select"
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        className="w-full p-4 bg-slate-800/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white"
                    >
                        {Object.values(NETWORKS).map(network => (
                            <option key={network.id} value={network.id}>
                                {network.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="w-full">
                     <label htmlFor="private-key-input" className="block text-sm font-medium text-slate-300 mb-2">Private Key</label>
                    <input
                        id="private-key-input"
                        type="password"
                        value={privateKey}
                        onChange={(e) => {
                            setPrivateKey(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Enter your private key"
                        className={`w-full p-4 bg-slate-800/60 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white placeholder-slate-500`}
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
                <motion.button
                    onClick={handleSubmit}
                    disabled={!privateKey}
                    className="w-full text-lg font-bold text-slate-900 py-4 px-6 rounded-xl bg-energy-gradient-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg"
                    whileHover={{ scale: 1.03, y: -2, boxShadow: '0px 10px 20px rgba(0, 255, 163, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    Import
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default ImportFromPrivateKey;

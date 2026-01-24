
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BackArrow from './icons/BackArrow'; // Corrected import
import * as bip39 from 'bip39';

const ImportFromMnemonic = ({ onMnemonicSubmit, onBack }) => {
    const [mnemonic, setMnemonic] = useState('');
    const [error, setError] = useState('');

    const validateMnemonic = (phrase) => {
        if (!phrase) return false;
        const words = phrase.trim().split(/\s+/g);
        return (words.length === 12 || words.length === 24) && bip39.validateMnemonic(phrase.trim());
    };

    const handleSubmit = () => {
        if (validateMnemonic(mnemonic)) {
            onMnemonicSubmit(mnemonic.trim());
        } else {
            setError('Invalid seed phrase. Please check the length (12 or 24 words) and spelling.');
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
                <h1 className="text-3xl font-bold text-white text-center ml-10 mr-10">Import Seed Phrase</h1>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center text-slate-400 mb-8">
                <p>Enter your 12 or 24-word seed phrase below.</p>
            </motion.div>

            <motion.div variants={itemVariants}>
                <textarea
                    value={mnemonic}
                    onChange={(e) => {
                        setMnemonic(e.target.value);
                        if (error) setError('');
                    }}
                    placeholder="Enter your 12 or 24 word seed phrase here..."
                    className={`w-full h-40 p-4 rounded-xl bg-slate-800/60 border ${error ? 'border-red-500' : 'border-slate-700'} focus:ring-2 focus:ring-cyan-400 focus:outline-none resize-none transition-all text-white placeholder-slate-500`}
                />
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
                <motion.button
                    onClick={handleSubmit}
                    disabled={!mnemonic || !validateMnemonic(mnemonic)}
                    className="w-full text-lg font-bold text-slate-900 py-4 px-6 rounded-xl bg-energy-gradient-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg"
                    whileHover={{ scale: 1.03, y: -2, boxShadow: '0px 10px 20px rgba(0, 255, 163, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    Import Wallet
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default ImportFromMnemonic;

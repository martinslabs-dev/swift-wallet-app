
import React from 'react';
import { motion } from 'framer-motion';
import BackArrow from './icons/BackArrow'; // Corrected import path

const ImportOption = ({ onClick, label, isFirst = false }) => (
    <motion.button
        onClick={onClick}
        className="w-full text-lg font-semibold text-white py-4 px-6 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 transition-all duration-300 ease-in-out shadow-lg"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
    >
        {label}
    </motion.button>
);

const ImportWallet = ({ onImportMnemonic, onImportPrivateKey, onViewOnly, onBack }) => {
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
                staggerChildren: 0.1, 
                delayChildren: 0.2 
            }
        },
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
                <h1 className="text-3xl font-bold text-white text-center ml-10 mr-10">Import Wallet</h1>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center text-slate-400 mb-8">
                <p>How would you like to import your existing wallet?</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
                <ImportOption onClick={onImportMnemonic} label="From Seed Phrase" isFirst={true} />
                <ImportOption onClick={onImportPrivateKey} label="From Private Key" />
                <ImportOption onClick={onViewOnly} label="Add View-Only Wallet" />
            </motion.div>
        </motion.div>
    );
};

export default ImportWallet;

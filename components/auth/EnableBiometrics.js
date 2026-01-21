
import React from 'react';
import { motion } from 'framer-motion';
import Fingerprint from './icons/Fingerprint';

const EnableBiometrics = ({ onEnable, onSkip }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex flex-col items-center justify-center h-screen p-6 text-white text-center"
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.8, type: "spring" } }}
            className="mb-8"
        >
            <Fingerprint />
        </motion.div>

        <motion.h1 
            className="text-3xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }}
        >
            Enable Biometrics
        </motion.h1>

        <motion.p 
            className="text-gray-400 max-w-xs mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.6, duration: 0.5 } }}
        >
            Use your fingerprint or face to unlock your wallet instantly.
        </motion.p>

        <div className="w-full max-w-xs">
            <motion.button 
                onClick={onEnable}
                className="w-full bg-energy-gradient text-black py-4 rounded-xl font-bold text-xl tracking-wider mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Enable
            </motion.button>
            <motion.button 
                onClick={onSkip}
                className="w-full bg-gray-700 text-white py-4 rounded-xl font-bold text-lg"
                whileHover={{ scale: 1.05, backgroundColor: "#4A5568" }}
                whileTap={{ scale: 0.95 }}
            >
                Skip for now
            </motion.button>
        </div>
    </motion.div>
  );
};

export default EnableBiometrics;

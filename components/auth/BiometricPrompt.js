
import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from './icons/Fingerprint';

const BiometricPrompt = ({ onEnable, onSkip }) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.3, delayChildren: 0.2, type: 'spring' }
        },
        exit: { opacity: 0, y: -50 }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-between h-screen p-6 text-white text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="w-full max-w-sm" /> 
            
            <motion.div className="flex flex-col items-center" variants={itemVariants}>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <Fingerprint className="w-32 h-32 text-electric-cyan" />
                </motion.div>

                <h1 className="text-4xl font-bold mt-8 mb-4">Enable Biometrics</h1>
                <p className="text-gray-400 text-lg max-w-xs">
                    Use your fingerprint or face to unlock your wallet instantly and securely.
                </p>
            </motion.div>

            <motion.div className="w-full max-w-sm pb-8" variants={itemVariants}>
                <div className="flex flex-col space-y-4">
                    <motion.button
                        className="w-full bg-energy-gradient text-black py-4 rounded-xl font-bold text-xl tracking-wider"
                        onClick={onEnable}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Enable Biometrics
                    </motion.button>
                    <motion.button
                        className="w-full bg-transparent text-gray-400 py-3 rounded-xl font-bold text-lg"
                        onClick={onSkip}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Skip for Now
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BiometricPrompt;

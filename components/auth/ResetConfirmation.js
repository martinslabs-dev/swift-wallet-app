
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedWarningIcon = () => (
    <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="w-24 h-24 mx-auto"
    >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FF4500" />
                </linearGradient>
            </defs>
            <motion.path
                d="M12 2L2 22h20L12 2z"
                stroke="url(#warning-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, fill: "rgba(255, 215, 0, 0)" }}
                animate={{ pathLength: 1, fill: "rgba(255, 215, 0, 0.1)" }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.line
                x1="12" y1="9" x2="12" y2="13"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1.3 }}
            />
            <motion.circle
                cx="12" cy="17" r="1"
                fill="#FFFFFF"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1.5 }}
            />
        </svg>
    </motion.div>
);

const ResetConfirmation = ({ onConfirm, onCancel, show }) => {
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring', damping: 25, stiffness: 150 }
        },
        exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.div
                        className="glass-card interactive-border w-full max-w-sm p-8 text-center shadow-2xl"
                        variants={modalVariants}
                    >
                        <div className="relative z-10">
                            <AnimatedWarningIcon />
                            <motion.h2 
                                className="text-3xl font-bold text-white mt-6 mb-4"
                                initial={{ y: 20, opacity: 0}} 
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.4 }}}
                            >
                                Are You Sure?
                            </motion.h2>
                            <motion.p 
                                className="text-gray-300 mb-8"
                                initial={{ y: 20, opacity: 0}} 
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.5 }}}
                            >
                                This will permanently delete all wallet data from this device. You can only recover your wallet if you have your seed phrase.
                            </motion.p>
                            <div className="flex flex-col space-y-4">
                                <motion.button
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg"
                                    onClick={onConfirm}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Yes, Delete and Reset
                                </motion.button>
                                <motion.button
                                    className="w-full bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white py-3 rounded-xl font-bold text-lg"
                                    onClick={onCancel}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResetConfirmation;

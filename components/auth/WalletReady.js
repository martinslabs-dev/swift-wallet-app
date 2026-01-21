
import React from 'react';
import { motion } from 'framer-motion';

// Custom Wallet SVG with animations
const AnimatedWalletIcon = () => {
    const walletVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { 
                type: "spring", 
                stiffness: 260,
                damping: 20,
                delay: 0.2
            }
        }
    };

    const checkVariants = {
        hidden: { pathLength: 0 },
        visible: {
            pathLength: 1,
            transition: { 
                duration: 0.8,
                ease: "circOut",
                delay: 0.8
            }
        }
    };

    const particleVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: i => ({
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            transition: {
                duration: 1.5,
                delay: 1 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
            }
        })
    };

    return (
        <motion.div className="relative w-48 h-48" variants={walletVariants}>
             {/* Particles */}
            <motion.div className="absolute w-4 h-4 rounded-full bg-electric-cyan" style={{ top: '10%', left: '10%' }} custom={1} variants={particleVariants} />
            <motion.div className="absolute w-3 h-3 rounded-full bg-magenta" style={{ top: '20%', right: '5%' }} custom={2} variants={particleVariants} />
            <motion.div className="absolute w-2 h-2 rounded-full bg-light-cyan" style={{ bottom: '15%', left: '25%' }} custom={3} variants={particleVariants} />
            <motion.div className="absolute w-3 h-3 rounded-full bg-magenta" style={{ bottom: '5%', right: '20%' }} custom={4} variants={particleVariants} />

            <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                    <linearGradient id="wallet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00FFA3" />
                        <stop offset="100%" stopColor="#00D1FF" />
                    </linearGradient>
                </defs>
                {/* Wallet Body */}
                <path d="M10 30 V 90 H 90 V 45 C 90 40 85 35 80 35 H 35 L 25 25 Z" fill="url(#wallet-gradient)" opacity="0.2" />
                <path d="M10 30 V 85 H 85 V 40 C 85 35 80 30 75 30 H 30 L 20 20 Z" fill="url(#wallet-gradient)" />
                {/* Check Mark */}
                 <motion.path 
                    d="M35 55 L 48 68 L 70 45"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={checkVariants}
                />
            </svg>
        </motion.div>
    );
};

const WalletReady = ({ onContinue }) => {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <motion.div 
            className="flex flex-col items-center justify-center h-screen p-6 text-white text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <div className="flex-grow flex flex-col items-center justify-center">
                <AnimatedWalletIcon />

                <motion.h1 
                    className="text-4xl font-bold mt-8 mb-4"
                    variants={itemVariants}
                >
                    Brilliant, your wallet is ready!
                </motion.h1>
                
                <motion.p 
                    className="text-gray-400 text-lg max-w-xs"
                    variants={itemVariants}
                >
                    You are all set to explore the world of decentralized finance.
                </motion.p>
            </div>

            <motion.div className="w-full max-w-sm pb-8" variants={itemVariants}>
                <motion.button 
                    className="w-full bg-energy-gradient text-black py-4 rounded-xl font-bold text-xl tracking-wider"
                    onClick={onContinue}
                     animate={{
                        scale: [1, 1.03, 1],
                        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Continue
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default WalletReady;

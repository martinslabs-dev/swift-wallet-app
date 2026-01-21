
import React from 'react';
import { motion } from 'framer-motion';

const TokenIcon = ({ symbol }) => (
    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border-2 border-gray-700">
        {symbol.charAt(0)}
    </div>
);

const DownArrow = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);

const MainDashboard = () => {
  const containerVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.3, delayChildren: 0.2, type: 'spring', damping: 25, stiffness: 120 }
      }
  }

  const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 120 } }
  }

  return (
    <motion.div 
        className="flex flex-col items-center justify-center h-screen w-full p-4 font-sans"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <motion.h1 className="text-4xl font-bold text-white mb-12" variants={itemVariants}>Swap Tokens</motion.h1>
        <div className="w-full max-w-md relative">
            <motion.div 
                className="glass-card p-5 mb-2 interactive-border shadow-lg"
                variants={itemVariants}
            >
                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                    <span>You Pay</span>
                    <span>Balance: 2.5</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <TokenIcon symbol="E" />
                        <span className="text-2xl font-bold text-white">ETH</span>
                    </div>
                    <span className="text-3xl font-mono text-white">1.0</span>
                </div>
            </motion.div>

            <motion.div 
                className="absolute w-full flex justify-center z-10"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                variants={itemVariants}
            >
                 <motion.div 
                    className="swap-orb flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.15, rotate: 180, transition: { duration: 0.4 } }}
                    whileTap={{ scale: 0.9 }}
                 >
                    <DownArrow />
                 </motion.div>
            </motion.div>

            <motion.div 
                className="glass-card p-5 mt-2 shadow-lg"
                variants={itemVariants}
            >
                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                    <span>You Receive</span>
                     <span>Balance: 1,204</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <TokenIcon symbol="U" />
                        <span className="text-2xl font-bold text-white">USDC</span>
                    </div>
                    <span className="text-3xl font-mono text-white">1,850.5</span>
                </div>
            </motion.div>
        </div>

        <motion.button 
            className="w-full max-w-md bg-energy-gradient text-black py-4 rounded-2xl font-bold text-xl tracking-wider mt-10 shadow-lg"
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5, boxShadow: '0px 10px 30px rgba(0, 255, 163, 0.4)' }}
            whileTap={{ scale: 0.98 }}
        >
            Confirm Swap
        </motion.button>
    </motion.div>
  );
};

export default MainDashboard;

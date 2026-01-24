
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PasscodeInput from './PasscodeInput';

const UnlockScreen = ({ onUnlock, error, clearError, onResetRequest, onImportWallet }) => {
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    if (passcode.length === 6) {
      onUnlock(passcode);
      setPasscode(''); // Reset after attempt
    }
  }, [passcode, onUnlock]);

  useEffect(() => {
    // Clear the error message after 3 seconds
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
        <PasscodeInput 
            title="Welcome Back"
            subtitle="Enter your passcode to unlock"
            passcode={passcode}
            onPasscodeChange={setPasscode}
            error={error}
            footer={
                <div className="text-center mt-8">
                    <p className="text-gray-500 mb-4">Having trouble or want to switch wallets?</p>
                    <div className="flex justify-center space-x-4">
                        <motion.button 
                            onClick={onResetRequest}
                            className="bg-red-600/20 text-red-300 py-3 px-6 rounded-lg font-bold transition-all duration-300 hover:bg-red-600/40 hover:text-red-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Reset Wallet
                        </motion.button>
                        <motion.button 
                            onClick={onImportWallet}
                            className="bg-blue-600/20 text-blue-300 py-3 px-6 rounded-lg font-bold transition-all duration-300 hover:bg-blue-600/40 hover:text-blue-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Import Wallet
                        </motion.button>
                    </div>
                </div>
            }
        />
    </motion.div>
  );
};

export default UnlockScreen;

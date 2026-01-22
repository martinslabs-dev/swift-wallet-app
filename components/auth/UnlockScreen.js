
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PasscodeInput from './PasscodeInput';

const UnlockScreen = ({ onUnlock, error, clearError, onResetRequest }) => {
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    if (passcode.length === 6) {
      onUnlock(passcode);
      setPasscode(''); // Reset after attempt
    }
  }, [passcode, onUnlock]);

  useEffect(() => {
    // Clear the error message after 3 seconds, unless it's a persistent error
    if (error && !error.includes('reconstruct') && !error.includes('corrupt')) {
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
                    <p className="text-gray-500 mb-4">Having trouble?</p>
                    <motion.button 
                        onClick={onResetRequest}
                        className="bg-red-600/20 text-red-300 py-3 px-6 rounded-lg font-bold transition-all duration-300 hover:bg-red-600/40 hover:text-red-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Reset Wallet
                    </motion.button>
                </div>
            }
        />
    </motion.div>
  );
};

export default UnlockScreen;

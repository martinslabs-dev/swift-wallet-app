
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
                <button onClick={onResetRequest} className="text-gray-500 hover:text-gray-300 transition-colors duration-300">
                    Forgot Passcode? Reset
                </button>
            }
        />
    </motion.div>
  );
};

export default UnlockScreen;

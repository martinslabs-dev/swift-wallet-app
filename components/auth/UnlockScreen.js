
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PasscodeInput from './PasscodeInput';
import { Fingerprint } from './icons/Fingerprint';

const UnlockScreen = ({ onUnlock, hasBiometrics, onBiometricUnlock, error, clearError, onResetRequest }) => {
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    if (passcode.length === 6) {
      onUnlock(passcode);
      setPasscode(''); // Reset after attempt
    }
  }, [passcode, onUnlock]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <motion.div
      className="flex flex-col justify-between h-screen w-full max-w-sm mx-auto p-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
        <PasscodeInput 
            title="Welcome Back"
            subtitle="Enter your passcode to unlock"
            passcode={passcode}
            onPasscodeChange={setPasscode}
            error={error}
        />
      

      <div className="w-full">
        <div className="text-center mt-6">
            <button onClick={onResetRequest} className="text-gray-500 hover:text-gray-300 transition-colors duration-300">
                Forgot Passcode? Reset
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UnlockScreen;

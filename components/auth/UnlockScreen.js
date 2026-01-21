import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NumberKeyboard from './NumberKeyboard';
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

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setPasscode(p => p.slice(0, -1));
    } else if (passcode.length < 6) {
      setPasscode(p => p + key);
    }
  };

  const PasscodeDots = () => (
    <div className="flex justify-center items-center space-x-4 my-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-4 h-4 rounded-full ${i < passcode.length ? 'bg-electric-cyan' : 'bg-gray-700'}`}
          animate={{ scale: i === passcode.length - 1 ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      className="flex flex-col justify-between h-screen w-full max-w-sm mx-auto p-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <div className="text-center pt-12">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-gray-400">Enter your passcode to unlock</p>
        <PasscodeDots />
        {error && (
          <motion.p 
            className="text-red-500 font-bold"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>

      <div className="w-full">
        <NumberKeyboard onKeyPress={handleKeyPress} onBiometricPress={onBiometricUnlock} hasBiometrics={hasBiometrics} />
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

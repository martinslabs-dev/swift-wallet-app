import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NumberKeyboard from './NumberKeyboard';

const ConfirmPasscode = ({ originalPasscode, onPasscodeConfirmed, onBack }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleKeyPress = (key) => {
    if (passcode.length < 6) {
        setError(''); // Clear error on new key press
        setPasscode(passcode + key);
    }
  };

  const handleBackspace = () => {
    setPasscode(passcode.slice(0, -1));
    setError(''); // Also clear error on backspace
  };

  useEffect(() => {
    if (passcode.length === 6) {
      if (passcode === originalPasscode) {
        setTimeout(() => onPasscodeConfirmed(), 300);
      } else {
        setError('Passcodes do not match.');
        // Animate the shaking effect for the input dots
        // Then clear the passcode so the user can re-enter
        setTimeout(() => {
            setPasscode('');
        }, 500);
      }
    }
  }, [passcode, originalPasscode, onPasscodeConfirmed]);

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex flex-col items-center justify-between h-screen p-6 text-white"
    >
        <div className="w-full max-w-sm text-center pt-16">
            <motion.h1 
                className="text-3xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.5 } }}
            >Confirm Passcode</motion.h1>
            <motion.p 
                className="text-gray-400 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
            >Re-enter your passcode.</motion.p>

            <motion.div 
                className={`flex justify-center space-x-3 mb-4 ${error ? 'animate-shake' : ''}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.5 } }}
            >
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-10 h-12 rounded-lg transition-all duration-300 transform ${passcode.length > i ? 'bg-energy-gradient scale-110' : 'bg-gray-700'}`}
                    />
                ))}
            </motion.div>

            {error && <p className="text-red-500 text-sm mt-4 h-6">{error}</p>}

        </div>

        <div className="w-full pb-8">
            <NumberKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} onBack={onBack} />
        </div>

        {/* Add a simple shake animation to globals.css */}
        <style jsx global>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .animate-shake {
                animation: shake 0.5s ease-in-out;
            }
        `}</style>
    </motion.div>
  );
};

export default ConfirmPasscode;

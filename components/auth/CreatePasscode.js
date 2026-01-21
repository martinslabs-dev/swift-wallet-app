import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NumberKeyboard from './NumberKeyboard';

const CreatePasscode = ({ onPasscodeCreated }) => {
  const [passcode, setPasscode] = useState('');

  const handleKeyPress = (key) => {
    if (passcode.length < 6) {
      setPasscode(passcode + key);
    }
  };

  const handleBackspace = () => {
    setPasscode(passcode.slice(0, -1));
  };

  useEffect(() => {
    if (passcode.length === 6) {
      // Automatically proceed to the next step
      setTimeout(() => onPasscodeCreated(passcode), 300); // Small delay for user to see the last digit
    }
  }, [passcode, onPasscodeCreated]);

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
            >Create Passcode</motion.h1>
            <motion.p 
                className="text-gray-400 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
            >Secure your wallet with a 6-digit passcode.</motion.p>

            <motion.div 
                className="flex justify-center space-x-3 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.5 } }}
            >
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-10 h-12 rounded-lg flex items-center justify-center text-3xl font-bold transition-all duration-300 transform ${passcode.length > i ? 'bg-energy-gradient scale-110' : 'bg-gray-700'}`}
                    />
                ))}
            </motion.div>
        </div>

        <div className="w-full pb-8">
            <NumberKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
        </div>
    </motion.div>
  );
};

export default CreatePasscode;

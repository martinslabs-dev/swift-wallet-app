
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Fingerprint from './icons/Fingerprint';
import NumberKeyboard from './NumberKeyboard';

const UnlockScreen = ({ onUnlock, hasBiometrics, onBiometricUnlock, error, clearError }) => {
    const [passcode, setPasscode] = useState('');

    const handleKeyPress = (key) => {
        if (passcode.length < 6) {
            clearError(); // Clear error on new key press
            const newPasscode = passcode + key;
            setPasscode(newPasscode);
            if (newPasscode.length === 6) {
                onUnlock(newPasscode);
                setPasscode(''); // Reset after attempt
            }
        }
    };

    const handleBackspace = () => {
        setPasscode(passcode.slice(0, -1));
        clearError(); // Also clear error on backspace
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center justify-between h-screen p-6 text-white"
        >
            <div className="w-full max-w-sm text-center pt-16">
                <motion.h1
                    className="text-3xl font-bold mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.5 } }}
                >
                    Welcome Back
                </motion.h1>

                {hasBiometrics ? (
                    <motion.div
                        className="flex flex-col items-center cursor-pointer"
                        onClick={onBiometricUnlock}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="mb-4">
                           <Fingerprint />
                        </div>
                        <p className="text-gray-400">Tap to use biometrics</p>
                    </motion.div>
                ) : (
                    <>
                        <motion.p
                            className="text-gray-400 mb-8"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
                        >
                            Enter your passcode to unlock.
                        </motion.p>
                        <motion.div
                            className={`flex justify-center space-x-3 mb-4 ${error ? 'animate-shake' : ''}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.5 } }}
                        >
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-10 h-12 rounded-lg transition-all duration-300 ${passcode.length > i ? 'bg-energy-gradient' : 'bg-gray-700'}`}
                                />
                            ))}
                        </motion.div>
                         {error && <p className="text-red-500 text-sm mt-4 h-6">{error}</p>}
                    </>
                )}
            </div>

            {!hasBiometrics && (
                <div className="w-full pb-8">
                    <NumberKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
                </div>
            )}
        </motion.div>
    );
};

export default UnlockScreen;

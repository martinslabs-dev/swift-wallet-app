
import React from 'react';
import { motion } from 'framer-motion';
import NumberKeyboard from './NumberKeyboard';

const PasscodeInput = ({ title, subtitle, passcode, onPasscodeChange, error }) => {

    const handleKeyPress = (key) => {
        if (passcode.length < 6) {
            onPasscodeChange(passcode + key);
        }
    };

    const handleBackspace = () => {
        onPasscodeChange(passcode.slice(0, -1));
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
                    className="text-3xl font-bold mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.5 } }}
                >{title}</motion.h1>
                <motion.p 
                    className="text-gray-400 mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
                >{subtitle}</motion.p>

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

            <div className="w-full pb-8">
                <NumberKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
            </div>
        </motion.div>
    );
};

export default PasscodeInput;

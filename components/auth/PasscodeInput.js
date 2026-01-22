
import React from 'react';
import { motion } from 'framer-motion';
import NumberKeyboard from './NumberKeyboard';

const PasscodeInput = ({ title, subtitle, passcode, onPasscodeChange, error, footer }) => {

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
            // Use flex-col and h-full to manage layout within the screen container
            className="flex flex-col h-full p-6 text-white"
        >
            {/* Top section for text and passcode dots */}
            <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-full max-w-sm text-center">
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
                    
                    <div className="h-6">
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
                </div>
            </div>

            {/* Bottom section for keyboard and footer */}
            <div className="w-full max-w-sm mx-auto flex-shrink-0">
                <NumberKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
                {footer && (
                    <div className="mt-4 text-center">
                        {footer}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PasscodeInput;

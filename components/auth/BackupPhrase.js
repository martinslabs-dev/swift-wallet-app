
import React from 'react';
import { motion } from 'framer-motion';

const BackupPhrase = ({ phrase, onContinue }) => {
    const words = phrase.split(' ');

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center h-screen p-6 text-white"
        >
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Secret Recovery Phrase</h1>
                <p className="text-gray-400 mb-8">
                    This is your secret phrase. Write it down on paper and keep it in a safe place. You'll be asked to re-enter this phrase (in order) on the next step.
                </p>

                <div className="grid grid-cols-3 gap-4 bg-gray-900/50 p-6 rounded-lg mb-8">
                    {words.map((word, index) => (
                        <div key={index} className="text-left">
                            <span className="text-gray-500 mr-2">{index + 1}.</span>
                            <span>{word}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={onContinue}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg"
                    >
                        I've Backed It Up
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default BackupPhrase;

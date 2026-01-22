
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const VerifyPhrase = ({ phrase, onVerified }) => {
    const originalWords = useMemo(() => phrase.split(' '), [phrase]);
    const shuffledWords = useMemo(() => [...originalWords].sort(() => Math.random() - 0.5), [originalWords]);

    const [selectedWords, setSelectedWords] = useState([]);
    const [isError, setIsError] = useState(false);

    const handleSelectWord = (word) => {
        setSelectedWords([...selectedWords, word]);
        setIsError(false); // Reset error on new selection
    };

    const handleRemoveWord = (index) => {
        setSelectedWords(selectedWords.filter((_, i) => i !== index));
    };

    const handleVerify = () => {
        if (selectedWords.join(' ') === phrase) {
            onVerified();
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 2000); // Hide error after 2s
        }
    };

    const isComplete = selectedWords.length === originalWords.length;

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center h-screen p-6 text-white"
        >
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Verify Your Phrase</h1>
                <p className="text-gray-400 mb-6">
                    Tap the words in the correct order to prove you have backed them up.
                </p>

                {/* Area for constructing the phrase */}
                <div className="bg-gray-900/50 p-4 rounded-lg min-h-[120px] flex flex-wrap gap-2 content-start mb-6">
                    {selectedWords.map((word, index) => (
                        <button key={index} onClick={() => handleRemoveWord(index)} className="bg-gray-700 rounded-md px-3 py-1">
                            {word}
                        </button>
                    ))}
                </div>

                {isError && <p className='text-red-500 mb-4'>Incorrect order. Please try again.</p>}

                {/* Word bank */}
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                    {shuffledWords.map((word, index) => {
                        const isSelected = selectedWords.includes(word);
                        return (
                            <button 
                                key={index} 
                                onClick={() => handleSelectWord(word)}
                                disabled={isSelected}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${isSelected ? 'bg-gray-800 text-gray-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                                {word}
                            </button>
                        )
                    })}
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={handleVerify}
                        disabled={!isComplete}
                        className={`font-bold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg ${!isComplete ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        Complete Backup
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default VerifyPhrase;

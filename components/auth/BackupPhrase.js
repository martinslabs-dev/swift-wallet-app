
import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const BackupPhrase = ({ phrase, onContinue, isViewing = false }) => {
    const words = phrase.split(' ');
    const [copied, setCopied] = React.useState(false);
    const [revealed, setRevealed] = React.useState(!isViewing);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(phrase);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = () => (
        <div className="grid grid-cols-3 gap-4 bg-gray-900/50 p-6 rounded-lg mb-8">
            {words.map((word, index) => (
                <div key={index} className="text-left">
                    <span className="text-gray-500 mr-2">{index + 1}.</span>
                    <span>{word}</span>
                </div>
            ))}
        </div>
    );

    const renderVeiledContent = () => (
        <div className="relative bg-gray-900/50 p-6 rounded-lg mb-8 cursor-pointer" onClick={() => setRevealed(true)}>
            <div className="grid grid-cols-3 gap-4 blur-md">
                {words.map((word, index) => (
                    <div key={index} className="text-left">
                        <span className="text-gray-500 mr-2">{index + 1}.</span>
                        <span>{word}</span>
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                 <FiEye className="text-4xl mb-2"/>
                 <p className='font-bold'>Tap to reveal</p>
            </div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 } 
    };

    if (isViewing) {
         return (
             <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 z-40"
             >
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl text-white"
                >
                    <h1 className="text-2xl font-bold mb-2 text-center">Your Recovery Phrase</h1>
                    <p className="text-gray-400 mb-6 text-center">Keep this phrase safe and private. It is the master key to all of your accounts.</p>

                    {revealed ? renderContent() : renderVeiledContent()}

                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={handleCopyToClipboard}
                            disabled={!revealed}
                            className="font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
                        >
                            {copied ? <><FiCheckCircle /><span>Copied!</span></> : <><FiCopy /><span>Copy Phrase</span></>}
                        </button>
                        <button 
                            onClick={onContinue}
                            className="font-bold py-3 px-6 rounded-full transition-colors duration-300 bg-gray-700 hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                 </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-white"
        >
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Secret Recovery Phrase</h1>
                <p className="text-gray-400 mb-8">
                    This is your secret phrase. Write it down on paper and keep it in a safe place. You'll be asked to re-enter this phrase (in order) on the next step.
                </p>

                {renderContent()}

                <div className="flex justify-center mt-8">
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


import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const ExportPrivateKeyScreen = ({ onBack, privateKey }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(privateKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-gray-900 z-30 flex flex-col items-center p-6 text-white"
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                     <h1 className="text-3xl font-bold">Private Key</h1>
                     <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                     </button>
                </div>

                {/* Warning */}
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <FiAlertTriangle className="text-2xl flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold">Never share this key!</h3>
                        <p className="text-sm">Anyone with this key can take full control of your assets.</p>
                    </div>
                </div>

                {/* Private Key Display */}
                <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm break-words mb-6">
                    {privateKey}
                </div>

                {/* Copy Button */}
                <button 
                    onClick={handleCopyToClipboard}
                    className="w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {copied ? <><FiCheckCircle /><span>Copied!</span></> : <><FiCopy /><span>Copy to Clipboard</span></>}
                </button>

            </div>
        </motion.div>
    );
};

export default ExportPrivateKeyScreen;

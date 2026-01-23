
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { FiCopy, FiCheckCircle, FiX } from 'react-icons/fi';

const ReceiveScreen = ({ wallet, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white"
        >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                <FiX className="text-3xl" />
            </button>

            <div className="w-full max-w-sm text-center">
                <h1 className="text-3xl font-bold mb-4">Receive ETH</h1>
                <p className="text-gray-400 mb-8">Share your address to receive funds.</p>

                <div className="bg-white p-6 rounded-lg mb-8 inline-block">
                    <QRCode value={wallet.address} size={220} bgColor={"#ffffff"} fgColor={"#000000"} />
                </div>

                <div className="bg-gray-800 p-4 rounded-lg break-words mb-6">
                    <p className="font-mono text-lg">{wallet.address}</p>
                </div>

                <button 
                    onClick={handleCopy}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                    {copied ? <FiCheckCircle /> : <FiCopy />}
                    {copied ? 'Address Copied!' : 'Copy Address'}
                </button>
            </div>
        </motion.div>
    );
};

export default ReceiveScreen;


import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const QRCodeScanner = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"
        >
            <div className="w-full max-w-md p-4">
                <div className="relative w-full aspect-square bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700/50">
                    {/* Placeholder for camera feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400">Camera Feed</p>
                    </div>

                    {/* Scanning Animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_5px_rgba(66,153,225,0.5)]"></div>
                </div>

                <button 
                    onClick={onClose} 
                    className="mt-8 bg-gray-800/80 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <FiX /> Cancel
                </button>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </motion.div>
    );
};

export default QRCodeScanner;

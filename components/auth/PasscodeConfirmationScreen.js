
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';

const PasscodeConfirmationScreen = ({ onConfirm, onCancel, error, clearError }) => {
    const [pass, setPass] = useState('');

    const handleConfirm = () => {
        onConfirm(pass);
        setPass('');
    };

    const handlePassChange = (e) => {
        if (error) clearError();
        setPass(e.target.value);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 z-40"
        >
            <div className="w-full max-w-sm glass-card p-8 rounded-2xl shadow-2xl text-white">
                <h2 className="text-xl font-bold text-center mb-4">Confirm Passcode</h2>
                <p className="text-center text-gray-400 mb-6">Please enter your passcode to proceed.</p>
                
                <input
                    type="password"
                    value={pass}
                    onChange={handlePassChange}
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-3 text-white text-center tracking-widest text-xl focus:outline-none focus:border-blue-500"
                    maxLength={6}
                />

                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onCancel}
                        className="w-full font-bold py-3 px-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <FiX />
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!pass}
                        className="w-full font-bold py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <FiCheck />
                        Confirm
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PasscodeConfirmationScreen;

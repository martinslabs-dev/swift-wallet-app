
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const RenameAccountScreen = ({ onBack, onRename, account }) => {
    const [newName, setNewName] = useState(account?.name || '');

    const handleRename = () => {
        if (newName.trim()) {
            onRename(account.index, newName.trim());
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-gray-900 z-30 flex flex-col items-center p-6 text-white"
        >
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <FiArrowLeft className="text-3xl" />
                    </button>
                    <h1 className="text-3xl font-bold">Rename Account</h1>
                    <div className="w-8"></div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="accountName">
                            Account Name
                        </label>
                        <input
                            id="accountName"
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g., My Savings"
                        />
                    </div>
                </div>

                <div className="mt-10">
                    <button
                        onClick={handleRename}
                        disabled={!newName.trim() || newName.trim() === account?.name}
                        className="w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-700 disabled:text-gray-500 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <FiSave />
                        <span>Save Name</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RenameAccountScreen;

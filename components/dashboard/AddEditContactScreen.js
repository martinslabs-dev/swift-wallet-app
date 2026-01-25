
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';

const AddEditContactScreen = ({ onBack, onSave, onDelete, existingContact }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const isEditing = !!existingContact;

    useEffect(() => {
        if (isEditing) {
            setName(existingContact.name);
            setAddress(existingContact.address);
        }
    }, [existingContact, isEditing]);

    const handleSave = () => {
        if (name.trim() && address.trim()) {
            onSave({ 
                ...existingContact, 
                name: name.trim(), 
                address: address.trim() 
            });
        }
    };

    const handleDelete = () => {
        if (isEditing) {
            onDelete(existingContact.id);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center p-6 text-white"
        >
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <FiArrowLeft className="text-3xl" />
                    </button>
                    <h1 className="text-3xl font-bold">{isEditing ? 'Edit Contact' : 'Add Contact'}</h1>
                    <div className="w-8"></div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="contactName">
                            Name
                        </label>
                        <input
                            id="contactName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Alice's Wallet"
                        />
                    </div>
                     <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="contactAddress">
                            Address
                        </label>
                        <textarea
                            id="contactAddress"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                            placeholder="0x... or a Solana/BTC address"
                            rows="3"
                        />
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-4">
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || !address.trim()}
                        className="w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-700 disabled:text-gray-500 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <FiSave />
                        <span>Save Contact</span>
                    </button>
                    {isEditing && (
                         <button
                            onClick={handleDelete}
                            className="w-full font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white"
                        >
                            <FiTrash2 />
                            <span>Delete Contact</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AddEditContactScreen;

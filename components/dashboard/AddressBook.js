
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash, FiX, FiSave, FiChevronLeft } from 'react-icons/fi';
import { storage } from '../../utils/storage';
import { ethers } from 'ethers';

const AddressBook = ({ onClose, onSelectContact, userId, sessionPasscode }) => {
    const [contacts, setContacts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [editedContact, setEditedContact] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadContacts = async () => {
            const storedContacts = await storage.getContacts(userId, sessionPasscode);
            setContacts(storedContacts);
        };
        loadContacts();
    }, [userId, sessionPasscode]);

    const handleSave = async () => {
        if (!editedContact.name.trim()) {
            setError('Name is required');
            return;
        }
        if (!ethers.isAddress(editedContact.address)) {
            setError('Invalid Ethereum address');
            return;
        }

        await storage.saveContact(editedContact, userId, sessionPasscode);
        const updatedContacts = await storage.getContacts(userId, sessionPasscode);
        setContacts(updatedContacts);
        setIsEditing(false);
        setEditedContact(null);
        setError('');
    };

    const handleDelete = async (address) => {
        await storage.deleteContact(address, userId, sessionPasscode);
        const updatedContacts = await storage.getContacts(userId, sessionPasscode);
        setContacts(updatedContacts);
    };

    const openEditor = (contact = null) => {
        setIsNew(!contact);
        setEditedContact(contact || { name: '', address: '' });
        setIsEditing(true);
    };
    
    const renderEditor = () => (
        <div className="absolute inset-0 bg-gray-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                 <button onClick={() => { setIsEditing(false); setError(''); }} className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><FiChevronLeft /> Back</button>
                <h3 className="text-lg font-bold text-white">{isNew ? 'New Contact' : 'Edit Contact'}</h3>
                <button onClick={handleSave} className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><FiSave /> Save</button>
            </div>
            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={editedContact.name}
                    onChange={(e) => setEditedContact({...editedContact, name: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg p-2 text-white"
                />
                 <input 
                    type="text" 
                    placeholder="Address" 
                    value={editedContact.address}
                    onChange={(e) => setEditedContact({...editedContact, address: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg p-2 text-white font-mono"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
        </div>
    );

    const renderList = () => (
        <div className="p-4">
            <button onClick={() => openEditor()} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mb-4">
                <FiPlus /> Add New Contact
            </button>
            <div className="space-y-3 h-64 overflow-y-auto">
                {contacts.length > 0 ? contacts.map((contact, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <div className="cursor-pointer" onClick={() => onSelectContact(contact.address)}>
                            <p className="text-white font-semibold">{contact.name}</p>
                            <p className="text-gray-400 text-sm font-mono">{`${contact.address.substring(0, 10)}...${contact.address.substring(contact.address.length - 8)}`}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => openEditor(contact)} className="text-gray-400 hover:text-white"><FiEdit /></button>
                            <button onClick={() => handleDelete(contact.address)} className="text-gray-400 hover:text-white"><FiTrash /></button>
                        </div>
                    </div>
                )) : <p className='text-gray-400 text-center'>No contacts yet.</p>}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Address Book</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX /></button>
                </div>
                <AnimatePresence>
                    {isEditing ? renderEditor() : renderList()}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AddressBook;

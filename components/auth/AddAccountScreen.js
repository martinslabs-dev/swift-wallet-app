import React, { useState } from 'react';

const AddAccountScreen = ({ onBack, onAddAccount }) => {
    const [accountName, setAccountName] = useState('');

    const handleAdd = () => {
        if (accountName.trim()) {
            onAddAccount(accountName.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="text-white mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold">Add New Account</h2>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Account Name</h3>
                <input 
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Savings, Trading"
                    className="w-full p-2 bg-gray-700 text-white rounded-md mb-4"
                />
                <button 
                    onClick={handleAdd}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold"
                >
                    Create
                </button>
            </div>
        </div>
    );
};

export default AddAccountScreen;

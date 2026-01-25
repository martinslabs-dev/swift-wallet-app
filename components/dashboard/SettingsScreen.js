
import React from 'react';
import { FiEdit } from 'react-icons/fi';

const SettingsScreen = ({ 
    onBack, 
    wallet, 
    activeNetwork, 
    onViewSeedPhrase, 
    onAddAccount, 
    onSwitchAccount,
    onShowExportPrivateKey,
    onShowRenameAccount
}) => {

    const getDisplayAddress = (account) => {
        if (!account) return '';
        switch (activeNetwork.chainType) {
            case 'evm': return account.evm?.address;
            case 'solana': return account.solana?.address;
            case 'bitcoin': return account.bitcoin?.address;
            default: return '';
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 flex flex-col" style={{ height: 'calc(100% - 64px)' }}>
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="text-white mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold">Settings</h2>
            </div>
            
            <div className="overflow-y-auto flex-grow">
                {/* Accounts Section */}
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-bold mb-2">My Accounts</h3>
                    <div className="space-y-2">
                        {wallet?.accounts.map((account, index) => {
                            const address = getDisplayAddress(account);
                            const isActive = index === wallet.activeAccountIndex;
                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <button 
                                        onClick={() => onSwitchAccount(index)}
                                        className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-white">{account.name}</p>
                                            <p className="font-mono text-sm text-gray-300">
                                                {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                    {!wallet?.viewOnly && (
                                         <button onClick={() => onShowRenameAccount(account)} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                                            <FiEdit className="text-white" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {!wallet?.viewOnly && (
                        <button 
                            onClick={onAddAccount}
                            className="w-full text-center py-2 px-2 mt-3 text-white bg-gray-700 hover:bg-gray-600 rounded-md"
                        >
                            + Add Account
                        </button>
                    )}
                </div>

                {/* Security Section */}
                {!wallet?.viewOnly && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-bold mb-2">Security</h3>
                        <button 
                            onClick={onViewSeedPhrase}
                            className="w-full text-left py-2 px-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md mb-2"
                        >
                            View Seed Phrase
                        </button>
                        <button 
                            onClick={onShowExportPrivateKey}
                            className="w-full text-left py-2 px-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md"
                        >
                            Export Private Key
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SettingsScreen;

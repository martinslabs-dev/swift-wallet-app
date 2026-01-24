
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft } from 'react-icons/fi';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import { useNetwork } from "../context/NetworkContext";
import { storage } from "../utils/storage";
import { reconstructWallet } from "../utils/wallet";
import { fetchEvmData } from "../services/evmService";

const HistoryPage = () => {
    const router = useRouter();
    const { activeNetwork } = useNetwork();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserAddress, setCurrentUserAddress] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'dev-mock-user-id';
            const sessionPasscode = prompt("Please enter your passcode to view history"); // Simplified for now

            if (!sessionPasscode) {
                setError("Passcode is required to view transaction history.");
                setIsLoading(false);
                return;
            }

            try {
                const walletData = await storage.getDecryptedWallet(sessionPasscode, userId);
                if (walletData) {
                    const decryptedWallet = reconstructWallet(walletData);
                    setCurrentUserAddress(decryptedWallet.evm.address);
                    const data = await fetchEvmData(decryptedWallet, activeNetwork);
                    setTransactions(data.transactions || []);
                } else {
                    setError("Failed to decrypt wallet. Incorrect passcode.");
                }
            } catch (err) {
                console.error("Error fetching transaction history:", err);
                setError("An error occurred while fetching history.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [activeNetwork]);

    const filteredTransactions = transactions.filter(tx => {
        const filterMatch = filter === 'all' || tx.type.toLowerCase() === filter;
        const searchMatch = searchTerm === '' || 
                            tx.shortTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.shortFrom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.tokenSymbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return filterMatch && searchMatch;
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
            <div className="w-full max-w-md mx-auto">
                <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <FiArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Transaction History</h1>
                </header>

                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                    <select 
                        onChange={(e) => setFilter(e.target.value)} 
                        className="bg-gray-800 border-gray-700 text-white text-sm rounded-md focus:ring-purple-500 focus:border-purple-500 py-2 px-3 appearance-none flex-grow"
                    >
                        <option value="all">All Types</option>
                        <option value="send">Sent</option>
                        <option value="receive">Received</option>
                        <option value="swap">Swap</option>
                        <option value="approve">Approval</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white text-sm rounded-md focus:ring-purple-500 focus:border-purple-500 py-2 px-3 flex-grow"
                    />
                </div>

                <div className="glass-card p-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-400">Loading transactions...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-400">{error}</div>
                    ) : (
                        <TransactionHistory 
                            transactions={filteredTransactions} 
                            currentUserAddress={currentUserAddress} 
                            network={activeNetwork}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;

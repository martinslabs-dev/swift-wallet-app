
import { useEffect, useState } from 'react';
import { useWalletConnect } from '../context/WalletConnectContext';
import QrScanner from '../components/walletconnect/QrScanner';
import { motion } from 'framer-motion';

const WalletConnectPage = () => {
    const { service, isInitialized } = useWalletConnect();
    const [sessions, setSessions] = useState([]);
    const [scanError, setScanError] = useState(null);

    const updateSessions = () => {
        if (service && isInitialized) {
            const activeSessions = service.getActiveSessions();
            setSessions(Object.values(activeSessions));
        }
    };

    useEffect(() => {
        updateSessions(); // Initial fetch
        const interval = setInterval(updateSessions, 2000); // Poll for sessions
        return () => clearInterval(interval);
    }, [service, isInitialized]);

    const handlePair = async (uri) => {
        if (service) {
            setScanError(null);
            try {
                await service.pair(uri);
            } catch (error) {
                setScanError("Invalid URI or pairing failed.");
            }
        }
    };
    
    const handleDisconnect = async (topic) => {
        if(service) {
            try {
                await service.disconnectSession(topic);
                updateSessions(); // Refresh the list immediately
            } catch (error) {
                console.error("Failed to disconnect session:", error);
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">WalletConnect</h1>

            <div className="mb-8 p-6 bg-gray-900 rounded-xl max-w-md mx-auto">
                <h2 className="text-xl font-bold text-white mb-4 text-center">Connect to a Dapp</h2>
                <QrScanner
                    onScanSuccess={handlePair}
                    onScanError={(err) => setScanError(`QR Scan Error: ${err}`)}
                />
                {scanError && <p className="text-red-500 mt-4 text-center">{scanError}</p>}
                
                <p className="text-gray-500 my-4 text-center">or paste URI below</p>
                
                <input 
                    type="text" 
                    placeholder="wc:a286a..."
                    className="w-full bg-gray-800 text-white p-3 rounded-lg text-center"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePair(e.target.value);
                    }}
                />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Active Sessions</h2>
            {sessions.length > 0 ? (
                <div className="space-y-4 max-w-md mx-auto">
                    {sessions.map(session => (
                        <motion.div 
                            key={session.topic} 
                            className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center overflow-hidden">
                                <img src={session.peer.metadata.icons[0]} alt={session.peer.metadata.name} className="w-12 h-12 rounded-full mr-4 flex-shrink-0" />
                                <div className='truncate'>
                                    <span className="text-white font-bold truncate block">{session.peer.metadata.name}</span>
                                    <p className="text-gray-400 text-sm truncate">{session.peer.metadata.url}</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={() => handleDisconnect(session.topic)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg ml-4 flex-shrink-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Disconnect
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">No active sessions.</p>
            )}
        </div>
    );
};

export default WalletConnectPage;

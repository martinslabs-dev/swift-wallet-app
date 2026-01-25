
import { FiLogOut, FiLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useDappConnection } from '../../context/DappConnectionContext';
import { useWallet } from '../../context/WalletContext'; 

const ConnectionManager = ({ dappUrl }) => {
    const { connect, disconnect, getConnection } = useDappConnection();
    const { accounts } = useWallet(); 
    
    const origin = new URL(dappUrl).origin;
    const connection = getConnection(origin);
    const isConnected = !!connection;

    const handleConnect = () => {
        if (accounts.length > 0) {
            connect(origin, [accounts[0].address]);
        } else {
            alert("Please create or import a wallet first.");
        }
    };

    const handleDisconnect = () => {
        disconnect(origin);
    };

    return (
        <motion.div 
            className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Not Connected'}</span>
            {isConnected ? (
                <button onClick={handleDisconnect} className="p-1 rounded-full hover:bg-gray-600">
                    <FiLogOut />
                </button>
            ) : (
                <button onClick={handleConnect} className="p-1 rounded-full hover:bg-gray-600">
                    <FiLink />
                </button>
            )}
        </motion.div>
    );
};

export default ConnectionManager;


import { AnimatePresence, motion } from 'framer-motion';
import { useWalletConnect } from '../../context/WalletConnectContext';
import { useNetwork } from '../../context/NetworkContext';

const SessionProposalModal = ({ proposal, onApprove, onReject }) => {
    if (!proposal) return null;

    const { params } = proposal;
    const { proposer, requiredNamespaces } = params;

    const { activeNetwork } = useNetwork();

    // A helper function to get accounts for a specific chain
    const getAccountsForChain = (chainId) => {
        // This is a simplified example. In a real wallet, you would look up the 
        // account associated with this chain.
        if (activeNetwork && activeNetwork.chainType === 'evm' && `eip155:${activeNetwork.chainId}` === chainId) {
            return activeNetwork.accounts;
        }
        return [];
    };

    // Prepare the namespaces for approval
    const handleApprove = () => {
        const accounts = [];
        Object.keys(requiredNamespaces).forEach(key => {
            const chainId = key.includes(':') ? key : `eip155:${key}`;
            const accountsForChain = getAccountsForChain(chainId);
            if(accountsForChain.length > 0) {
                accounts.push(...accountsForChain.map(acc => `${chainId}:${acc}`));
            }
        });

        if (accounts.length === 0) {
            // You might want to show an error to the user here
            console.error("No matching accounts found for the required chains.");
            return;
        }

        onApprove(proposal, accounts);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-gray-800 rounded-2xl w-full max-w-sm shadow-lg p-6 text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <img src={proposer.metadata.icons[0]} alt={proposer.metadata.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">{proposer.metadata.name} wants to connect</h2>
                    <p className="text-gray-400 mb-6 break-words">{proposer.metadata.url}</p>

                    {/* You could add more details about requested permissions here */}

                    <div className="flex flex-col gap-4">
                        <motion.button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg"
                            onClick={handleApprove}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Approve
                        </motion.button>
                        <motion.button
                            className="w-full bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white py-3 rounded-xl font-bold text-lg"
                            onClick={() => onReject(proposal)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Reject
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SessionProposalModal;

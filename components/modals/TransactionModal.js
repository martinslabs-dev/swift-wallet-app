
import { useModal } from '../../context/ModalContext';
import { motion } from 'framer-motion';

const TransactionModal = ({ data }) => {
    const { hideModal, decisionCallbacks } = useModal();
    const { transaction } = data;

    const handleApprove = () => {
        if (decisionCallbacks) {
            decisionCallbacks.resolve({ approved: true, transaction });
        }
        hideModal();
    };

    const handleReject = () => {
        if (decisionCallbacks) {
            decisionCallbacks.reject(new Error('User rejected the transaction.'));
        }
        hideModal();
    };

    return (
        <motion.div 
            className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-6"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
        >
            <h2 className="text-2xl font-bold mb-4">Transaction Request</h2>
            
            <div className="space-y-3 text-sm">
                <p><span className="font-semibold">From:</span> {transaction.from}</p>
                <p><span className="font-semibold">To:</span> {transaction.to}</p>
                <p><span className="font-semibold">Value:</span> {transaction.value ? parseInt(transaction.value, 16) / 1e18 : 0} ETH</p>
                <p><span className="font-semibold">Gas Limit:</span> {transaction.gas ? parseInt(transaction.gas, 16) : 'N/A'}</p>
                <p><span className="font-semibold">Gas Price:</span> {transaction.gasPrice ? parseInt(transaction.gasPrice, 16) / 1e9 : 'N/A'} Gwei</p>
                <div className="bg-gray-900 p-3 rounded mt-2">
                    <p className="font-semibold">Data:</p>
                    <pre className="whitespace-pre-wrap break-all text-xs mt-1">{transaction.data || '0x'}</pre>
                </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
                <button 
                    onClick={handleReject} 
                    className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                >
                    Reject
                </button>
                <button 
                    onClick={handleApprove} 
                    className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
                >
                    Approve
                </button>
            </div>
        </motion.div>
    );
};

export default TransactionModal;

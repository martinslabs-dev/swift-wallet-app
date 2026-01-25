
import { useModal } from '../../context/ModalContext';
import { motion } from 'framer-motion';

const SigningModal = ({ data }) => {
    const { hideModal, decisionCallbacks } = useModal();
    const { message, method } = data;

    const handleApprove = () => {
        if (decisionCallbacks) {
            // The actual signing will happen in the dapp-browser, here we just approve.
            decisionCallbacks.resolve({ approved: true });
        }
        hideModal();
    };

    const handleReject = () => {
        if (decisionCallbacks) {
            decisionCallbacks.reject(new Error('User rejected the message signature.'));
        }
        hideModal();
    };

    // Helper to decode hex messages
    const hexToUtf8 = (hex) => {
        try {
            return decodeURIComponent(
                hex.replace(/\s/g, '').replace(/[0-9a-f]{2}/g, '%$&')
            );
        } catch (e) {
            console.error("Failed to decode hex string:", e);
            return hex; // Return original hex if decoding fails
        }
    };

    const messageToDisplay = method === 'personal_sign' ? hexToUtf8(message) : message;

    return (
        <motion.div 
            className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-6"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
        >
            <h2 className="text-2xl font-bold mb-4">Signature Request</h2>
            
            <div className="space-y-3 text-sm">
                <p className="font-semibold">Your signature is being requested for the following message:</p>
                <div className="bg-gray-900 p-4 rounded-md mt-2 max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-all text-xs">{messageToDisplay}</pre>
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
                    Sign
                </button>
            </div>
        </motion.div>
    );
};

export default SigningModal;

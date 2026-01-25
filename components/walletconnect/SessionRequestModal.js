
import { AnimatePresence, motion } from 'framer-motion';

// A helper to format the request parameters for display
const RequestDetails = ({ request }) => {
    if (!request || !request.params || !request.params.request) {
        return <p className="text-red-500">Invalid request format.</p>;
    }
    const { method, params } = request.params.request;

    switch (method) {
        case 'personal_sign':
            // params[0] is the message, params[1] is the address
            return (
                <div>
                    <p className="text-gray-400 mb-2">You are signing a message:</p>
                    <div className="bg-gray-900 p-4 rounded-lg text-left break-words max-h-40 overflow-y-auto">
                        <pre className="text-white whitespace-pre-wrap">{params[0]}</pre>
                    </div>
                </div>
            );
        case 'eth_sendTransaction':
            const tx = params[0];
            return (
                <div>
                    <p className="text-gray-400 mb-2">You are being asked to sign a transaction:</p>
                    <div className="bg-gray-900 p-4 rounded-lg text-left text-sm space-y-2">
                        {tx.from && <p><strong className="text-gray-400">From:</strong> {tx.from}</p>}
                        {tx.to && <p><strong className="text-gray-400">To:</strong> {tx.to}</p>}
                        {tx.value && <p><strong className="text-gray-400">Value:</strong> {parseInt(tx.value, 16) / 1e18} ETH</p>}
                        {tx.data && <p className="break-words"><strong className="text-gray-400">Data:</strong> {tx.data.slice(0, 100)}...</p>}
                    </div>
                </div>
            );
        // Add more cases here for other methods like eth_signTypedData_v4, etc.
        default:
            return (
                 <div>
                    <p className="text-gray-400 mb-2">Unsupported method:</p>
                     <p className="text-white font-mono">{method}</p>
                </div>
            );
    }
}


const SessionRequestModal = ({ session, request, onApprove, onReject }) => {
    if (!request || !session) return null;

    const { topic, id } = request;
    const { peer } = session;
    const { request: requestDetails } = request.params;
    
    const handleApprove = () => {
        // This is where the actual signing would happen.
        // For now, we will just simulate a successful response.
        // This would involve a call to ethers or a similar library with the user's private key.
        console.warn("Signing is not implemented. Returning a placeholder success response.");
        const result = "0x4355c44b96e3b4260fed4b2b1e0640d8299839a25e8d884f645800f9a2f244a2";
        onApprove({ topic, id, result });
    };

    const handleReject = () => {
        onReject({ topic, id, error: { code: 5000, message: "User rejected." } });
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
                    <img src={peer.metadata.icons[0]} alt={peer.metadata.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-1">{peer.metadata.name}</h2>
                    <p className="text-gray-400 mb-4">{peer.metadata.url}</p>

                    <h3 className="text-lg font-bold text-white mb-4">Request: <span className='font-mono'>{requestDetails.method}</span></h3>

                    <div className="mb-6">
                       <RequestDetails request={request} />
                    </div>

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
                            onClick={handleReject}
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

export default SessionRequestModal;

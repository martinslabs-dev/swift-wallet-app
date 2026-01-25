
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink } from 'react-icons/fi';
import { format } from 'date-fns';

const TransactionDetailModal = ({ transaction, onClose, network }) => {
    if (!transaction) return null;

    const { id, type, amount, status, date, fee, sender, recipient, token } = transaction;

    const explorerLink = network.explorerUrl ? `${network.explorerUrl}/tx/${id}` : null;

    const renderDetail = (label, value, isMono = false) => (
        <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-400">{label}</span>
            <span className={`${isMono ? 'font-mono' : 'font-semibold'} text-right text-white`}>{value}</span>
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-slate-800/80 border border-slate-700 rounded-2xl w-full max-w-md shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Transaction Details</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <FiX size={24} />
                        </button>
                    </header>

                    <div className="p-6">
                        <div className="text-center mb-6">
                            <p className="text-4xl font-bold theme-gradient-text">{amount} {token?.symbol || network.nativeCurrency.symbol}</p>
                            <p className={`capitalize font-semibold mt-2 ${
                                status === 'completed' ? 'text-green-400' :
                                status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'
                            }`}>{status}</p>
                        </div>
                        
                        {renderDetail("Type", <span className={`capitalize ${type === 'send' ? 'text-red-400' : 'text-green-400'}`}>{type}</span>)}
                        {renderDetail("Date", date ? format(new Date(date), 'PPpp') : 'N/A')}
                        {recipient && renderDetail("Recipient", `${recipient.slice(0, 8)}...${recipient.slice(-8)}`, true)}
                        {sender && renderDetail("Sender", `${sender.slice(0, 8)}...${sender.slice(-8)}`, true)}
                        {fee && renderDetail("Network Fee", `${fee}`)}
                        
                        <div className="flex justify-between items-center py-3">
             <span className="text-slate-400">Transaction ID</span>
             <div className="flex items-center gap-2">
                 <span className="font-mono text-right text-white">{`${id.slice(0, 8)}...${id.slice(-8)}`}</span>
                 {explorerLink && (
                     <a href={explorerLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                         <FiExternalLink />
                     </a>
                 )}
             </div>
         </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TransactionDetailModal;

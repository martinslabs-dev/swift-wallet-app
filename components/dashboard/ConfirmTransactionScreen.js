
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FiX, FiCheckCircle, FiLoader, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { ERC20_ABI } from '../../utils/tokens';

const ConfirmTransactionScreen = ({ wallet, transaction, onCancel, onComplete, network }) => {
    const [status, setStatus] = useState('idle'); // idle, estimating, confirming, sending, success, error
    const [gasFee, setGasFee] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const estimateGas = async () => {
            setStatus('estimating');
            setError('');
            try {
                const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                const { toAddress, amount, asset } = transaction;

                let gasEstimate;
                if (asset.address) { // Token
                    const tokenContract = new ethers.Contract(asset.address, ERC20_ABI, provider);
                    const decimals = await tokenContract.decimals();
                    const amountInSmallestUnit = ethers.parseUnits(amount, decimals);
                    gasEstimate = await tokenContract.transfer.estimateGas(toAddress, amountInSmallestUnit, { from: wallet.address });
                } else { // Native asset
                    gasEstimate = await provider.estimateGas({ to: toAddress, value: ethers.parseEther(amount) });
                }
                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice;
                const gasCost = ethers.formatEther(gasEstimate * gasPrice);
                setGasFee(parseFloat(gasCost).toFixed(6));
                setStatus('confirming');
            } catch (err) {
                console.error("Gas estimation error:", err);
                setError('Could not estimate gas. The transaction may fail.');
                setStatus('error');
            }
        };

        if (wallet && transaction) {
            estimateGas();
        }
    }, [wallet, transaction, network.rpcUrl]);

    const handleConfirm = async () => {
        setStatus('sending');
        setError('');
        try {
            const provider = new ethers.JsonRpcProvider(network.rpcUrl);
            const signer = new ethers.Wallet(wallet.privateKey, provider);
            const { toAddress, amount, asset } = transaction;

            let txResponse;
            if (asset.address) { // Token transfer
                const tokenContract = new ethers.Contract(asset.address, ERC20_ABI, signer);
                const decimals = await tokenContract.decimals();
                const amountInSmallestUnit = ethers.parseUnits(amount, decimals);
                txResponse = await tokenContract.transfer(toAddress, amountInSmallestUnit);
            } else { // Native asset transfer
                txResponse = await signer.sendTransaction({
                    to: toAddress,
                    value: ethers.parseEther(amount)
                });
            }
            
            // --- THIS IS THE KEY CHANGE ---
            // Immediately call onComplete with the transaction response.
            // The parent component will now handle monitoring.
            onComplete(txResponse);

        } catch (err) {
            console.error("Transaction failed:", err);
            setError('Transaction failed. Not enough funds for gas?');
            setStatus('error');
        }
    };
    
    const renderMainContent = () => {
        const { toAddress, amount, asset } = transaction;
        return (
            <div>
                <h2 className="text-2xl font-bold text-center mb-6">Confirm Transaction</h2>
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">To:</span>
                        <span className="font-mono text-sm break-all">{toAddress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Amount:</span>
                        <span className="font-bold text-xl">{amount} {asset.symbol}</span>
                    </div>
                     <div className="border-t border-gray-700 my-2"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gas Fee:</span>
                        {status === 'estimating' || gasFee === null ? (
                            <span className="font-mono text-sm">Estimating...</span>
                        ) : (
                            <span className="font-mono text-sm">~{gasFee} {network.currencySymbol}</span>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <button onClick={handleConfirm} disabled={status !== 'confirming'} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${status !== 'confirming' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                        {status === 'sending' && <FiLoader className="animate-spin" />} 
                        {status === 'sending' ? 'Submitting...' : 'Confirm'}
                    </button>
                    <button onClick={() => onComplete(null)} disabled={status === 'sending'} className="w-full text-gray-400 hover:text-white transition-colors py-2 disabled:opacity-50">Cancel</button>
                </div>
            </div>
        );
    }

    const renderErrorContent = () => (
        <div className="text-center">
            <FiAlertTriangle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Transaction Failed</h2>
            <p className="text-gray-400 bg-gray-900/50 p-3 rounded-lg mb-6">{error}</p>
            <button onClick={() => onComplete(null)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors">Close</button>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 text-white"
        >
            <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl">
                {status === 'error' ? renderErrorContent() : renderMainContent()}
            </div>
        </motion.div>
    );
};

export default ConfirmTransactionScreen;

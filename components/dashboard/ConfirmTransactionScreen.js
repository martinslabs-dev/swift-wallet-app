
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FiX, FiCheckCircle, FiLoader, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { ERC20_ABI } from '../../utils/tokens';

const ConfirmTransactionScreen = ({ wallet, transaction, onCancel, onComplete, network }) => {
    const [status, setStatus] = useState('idle'); // idle, estimating, confirming, sending, success, error
    const [gasFee, setGasFee] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const estimateGas = async () => {
            setStatus('estimating');
            setError('');
            try {
                const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
                const signer = new ethers.Wallet(wallet.privateKey, provider);
                const { toAddress, amount, asset } = transaction;

                let gasEstimate;
                if (asset.address) { // It's a token
                    const tokenContract = new ethers.Contract(asset.address, ERC20_ABI, signer);
                    const decimals = await tokenContract.decimals();
                    const amountInSmallestUnit = ethers.utils.parseUnits(amount, decimals);
                    gasEstimate = await tokenContract.estimateGas.transfer(toAddress, amountInSmallestUnit);
                } else { // It's the native asset (e.g., ETH)
                    const tx = {
                        to: toAddress,
                        value: ethers.utils.parseEther(amount)
                    };
                    gasEstimate = await provider.estimateGas(tx);
                }
                const gasPrice = await provider.getGasPrice();
                const gasCost = ethers.utils.formatEther(gasEstimate.mul(gasPrice));
                setGasFee(parseFloat(gasCost).toFixed(6));
                setStatus('confirming');
            } catch (err) {
                console.error("Gas estimation error:", err);
                setError('Could not estimate gas. The transaction may fail.');
                setStatus('error');
            }
        };

        estimateGas();
    }, [wallet, transaction, network.rpcUrl]);

    const handleConfirm = async () => {
        setStatus('sending');
        setError('');
        try {
            const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
            const signer = new ethers.Wallet(wallet.privateKey, provider);
            const { toAddress, amount, asset } = transaction;

            let txResponse;
             if (asset.address) { // Token transfer
                const tokenContract = new ethers.Contract(asset.address, ERC20_ABI, signer);
                const decimals = await tokenContract.decimals();
                const amountInSmallestUnit = ethers.utils.parseUnits(amount, decimals);
                txResponse = await tokenContract.transfer(toAddress, amountInSmallestUnit);
            } else { // Native asset transfer
                txResponse = await signer.sendTransaction({
                    to: toAddress,
                    value: ethers.utils.parseEther(amount)
                });
            }
            setTxHash(txResponse.hash);
            await txResponse.wait(); // Wait for transaction to be mined
            setStatus('success');
        } catch (err) {
            console.error("Transaction failed:", err);
            setError('Transaction failed. Please check your balance and try again.');
            setStatus('error');
        }
    };

    const renderContent = () => {
        if (status === 'success') {
            return (
                <div className="text-center">
                    <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Transaction Sent!</h2>
                    <p className="text-gray-400 mb-6">Your transaction has been submitted to the network.</p>
                    <a href={`${network.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors">
                        View on Explorer <FiExternalLink />
                    </a>
                    <button onClick={onComplete} className="mt-4 w-full text-gray-400 hover:text-white transition-colors py-2">Close</button>
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div className="text-center">
                    <FiAlertTriangle className="text-red-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Transaction Failed</h2>
                    <p className="text-gray-400 bg-gray-900/50 p-3 rounded-lg mb-6">{error}</p>
                    <button onClick={onCancel} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors">Back</button>
                </div>
            );
        }

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
                        {status === 'estimating' ? (
                            <span className="font-mono text-sm">Estimating...</span>
                        ) : (
                            <span className="font-mono text-sm">~{gasFee} {network.currencySymbol}</span>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <button onClick={handleConfirm} disabled={status !== 'confirming'} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${status !== 'confirming' ? 'bg-gray-700 text-gray-500' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                        {status === 'sending' && <FiLoader className="animate-spin" />} 
                        {status === 'sending' ? 'Sending...' : 'Confirm'}
                    </button>
                    <button onClick={onCancel} className="w-full text-gray-400 hover:text-white transition-colors py-2">Cancel</button>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 text-white"
        >
            <div className="w-full max-w-md glass-card p-8 rounded-2xl">
                {renderContent()}
            </div>
        </motion.div>
    );
};

export default ConfirmTransactionScreen;

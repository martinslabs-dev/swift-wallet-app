
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FiLoader, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { ERC20_ABI } from '../../utils/tokens';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import FeeSelector from './FeeSelector'; // Re-using the fee selector

const bip32 = BIP32Factory(ecc);
const SATOSHIS_PER_BTC = 100_000_000;
const ONE_INCH_API_KEY = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY;

// --- Helper Components ---
const StatusIndicator = ({ status, error, txHash, network, onDone }) => (
    <div className="text-center">
        {status === 'error' && <FiAlertTriangle className="text-red-500 text-6xl mx-auto mb-4" />}
        {status === 'success' && <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />}
        <h2 className="text-2xl font-bold mb-2">
            {status === 'error' && 'Transaction Failed'}
            {status === 'success' && 'Transaction Submitted'}
        </h2>
        {error && <p className="text-gray-400 bg-gray-900/50 p-3 rounded-lg mb-6 text-xs break-words">{error}</p>}
        {txHash && (
             <div className="mt-4">
                <a href={`${network.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                    View on Explorer
                </a>
            </div>
        )}
         <button onClick={onDone} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors mt-8">Done</button>
    </div>
);

// --- Main Component ---
const ConfirmTransactionScreen = ({ wallet, transaction, onCancel, onComplete, network, activeAccount, utxos }) => {
    const [status, setStatus] = useState('confirming'); // Default to confirming as fee is passed in
    const [error, setError] = useState('');
    const [txHash, setTxHash] = useState(null);
    
    // The 'transaction' prop now contains the selected fee information
    const { toAddress, amount, asset, fee } = transaction;

    const handleConfirm = async () => {
        setStatus('sending');
        setError('');
        try {
            let txResponse;
            if (network.chainType === 'evm') {
                txResponse = await handleConfirmEvm();
            } else if (network.chainType === 'bitcoin') {
                txResponse = await handleConfirmBtc();
            }
            setTxHash(txResponse.hash || txResponse.txid);
            setStatus('success');
        } catch (err) {
            const message = err.reason || err.response?.data?.message || err.message || 'Transaction failed.';
            console.error("Transaction failed:", err);
            setError(message);
            setStatus('error');
        }
    };

    const handleConfirmEvm = async () => {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        const signer = new ethers.Wallet(activeAccount.evm.privateKey, provider);
        
        const tx = {
            to: toAddress,
            value: ethers.parseEther(amount), // Assuming native asset for simplicity, token transfers are different
            gasPrice: fee.gasPrice, // Use the selected gas price
            // You might need gasLimit as well, which should be estimated beforehand
        };

        if (asset.isNative) {
             return signer.sendTransaction(tx);
        } else {
             const tokenContract = new ethers.Contract(asset.address, ERC20_ABI, signer);
             const tokenAmount = ethers.parseUnits(amount, asset.decimals);
             return tokenContract.transfer(toAddress, tokenAmount, { gasPrice: fee.gasPrice });
        }
    };

    const handleConfirmBtc = async () => {
        // This logic would need to be adapted to use the fee rate from the 'fee' prop
        // For now, it remains as a placeholder.
        throw new Error("Bitcoin transaction confirmation not yet implemented with dynamic fees.");
    };

    const renderMainContent = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">Confirm Transaction</h2>
                 <button onClick={onCancel} className="text-gray-400 hover:text-white">
                     <FiX size={24}/>
                 </button>
            </div>
           
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-bold text-xl">{amount} {asset.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">To:</span>
                    <span className="font-mono text-sm break-all">{toAddress}</span>
                </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Network Fee</h3>
                    <div className='text-right'>
                         <span className="font-mono text-sm">{fee.feeEth} {network.nativeCurrency.symbol}</span>
                         <span className="text-xs text-gray-400"> (${fee.feeUsd})</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-4 mt-8">
                <button onClick={handleConfirm} disabled={status === 'sending'} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${status === 'sending' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                    {status === 'sending' ? <FiLoader className="animate-spin" /> : 'Confirm'}
                    {status === 'sending' && 'Submitting...'}
                </button>
                <button onClick={onCancel} disabled={status === 'sending'} className="w-full text-gray-400 hover:text-white transition-colors py-2 disabled:opacity-50">Cancel</button>
            </div>
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
                { (status === 'success' || status === 'error') 
                    ? <StatusIndicator status={status} error={error} txHash={txHash} network={network} onDone={onComplete} />
                    : renderMainContent()
                }
            </div>
        </motion.div>
    );
};

export default ConfirmTransactionScreen;

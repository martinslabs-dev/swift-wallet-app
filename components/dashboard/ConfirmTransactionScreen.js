
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FiX, FiCheckCircle, FiLoader, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { ERC20_ABI } from '../../utils/tokens';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const SATOSHIS_PER_BTC = 100_000_000;

const ConfirmTransactionScreen = ({ wallet, transaction, onCancel, onComplete, network }) => {
    const [status, setStatus] = useState('idle');
    const [fee, setFee] = useState(null);
    const [error, setError] = useState('');

    const estimateEvmGas = useCallback(async () => {
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
            setFee(parseFloat(gasCost).toFixed(6));
            setStatus('confirming');
        } catch (err) {
            console.error("Gas estimation error:", err);
            setError('Could not estimate gas. The transaction may fail.');
            setStatus('error');
        }
    }, [wallet, transaction, network.rpcUrl]);

    const estimateBitcoinFee = useCallback(async () => {
        setStatus('estimating');
        setError('');
        try {
            const { toAddress, amount } = transaction;
            const amountSats = Math.round(parseFloat(amount) * SATOSHIS_PER_BTC);

            const { data: feeRates } = await axios.get(`${network.etherscanApiUrl}/fee-estimates`);
            const feeRate = feeRates.fastestFee; // Use the fastest fee for now

            // Dummy transaction for size estimation
            const psbt = new bitcoin.Psbt({ network: network.bitcoinjslib_network });
            // A typical P2WPKH input is ~68 bytes.
            // We assume one input for simplicity, though this is not accurate.
            // A more accurate estimation requires fetching UTXOs first.
            psbt.addInput({ hash: '0'.repeat(64), index: 0, witnessUtxo: { script: Buffer.alloc(22), value: amountSats } });
            psbt.addOutput({ address: toAddress, value: amountSats });
            psbt.addOutput({ address: wallet.bitcoin.address, value: 0 }); // Change output

            const txSize = psbt.extractTransaction(true).toBuffer().length + 2; // Add a couple of bytes for safety
            const calculatedFee = txSize * feeRate;
            setFee((calculatedFee / SATOSHIS_PER_BTC).toFixed(8));
            setStatus('confirming');
        } catch (err) {
            console.error("Bitcoin fee estimation error:", err);
            setError('Could not estimate network fee.');
            setStatus('error');
        }
    }, [wallet, transaction, network]);

    useEffect(() => {
        if (wallet && transaction) {
            if (network.chainType === 'evm') {
                estimateEvmGas();
            } else if (network.chainType === 'bitcoin') {
                estimateBitcoinFee();
            }
        }
    }, [wallet, transaction, network, estimateEvmGas, estimateBitcoinFee]);

    const handleConfirmEvm = async () => {
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
        return txResponse;
    };

    const handleConfirmBitcoin = async () => {
        const { toAddress, amount } = transaction;
        const amountSats = Math.round(parseFloat(amount) * SATOSHIS_PER_BTC);
        const feeRate = parseFloat(fee) * SATOSHIS_PER_BTC / 100; // Simplified fee rate calc

        const { data: utxos } = await axios.get(`${network.etherscanApiUrl}/address/${wallet.bitcoin.address}/utxo`);
        
        const psbt = new bitcoin.Psbt({ network: network.bitcoinjslib_network });
        const keyPair = bip32.fromBase58(wallet.bitcoin.bip32.toBase58(), network.bitcoinjslib_network);

        let totalInput = 0;
        utxos.forEach(utxo => {
            totalInput += utxo.value;
            psbt.addInput({ 
                hash: utxo.txid, 
                index: utxo.vout,
                witnessUtxo: { script: Buffer.from(utxo.scriptpubkey, 'hex'), value: utxo.value },
            });
        });

        const estimatedTxSize = utxos.length * 68 + 2 * 34 + 10;
        const estimatedFee = estimatedTxSize * feeRate;
        const change = totalInput - amountSats - estimatedFee;

        if (change < 0) {
            throw new Error('Insufficient funds for transaction and fees.');
        }

        psbt.addOutput({ address: toAddress, value: amountSats });
        if (change > 546) { // Dust limit
            psbt.addOutput({ address: wallet.bitcoin.address, value: change });
        }

        psbt.signAllInputs(keyPair);
        psbt.finalizeAllInputs();

        const txHex = psbt.extractTransaction().toHex();
        const { data: txId } = await axios.post(`${network.etherscanApiUrl}/tx`, txHex);
        
        // The response is just the txid string, so we create a mock response object
        return {
            hash: txId,
            from: wallet.bitcoin.address,
            to: toAddress,
            value: amount,
            wait: async () => Promise.resolve() // Bitcoin txs don't have a `wait` like ethers
        };
    };

    const handleConfirm = async () => {
        setStatus('sending');
        setError('');
        try {
            let txResponse;
            if (network.chainType === 'evm') {
                txResponse = await handleConfirmEvm();
            } else if (network.chainType === 'bitcoin') {
                txResponse = await handleConfirmBitcoin();
            }
            onComplete(txResponse);
        } catch (err) {
            console.error("Transaction failed:", err.response ? err.response.data : err.message);
            setError(err.message || 'Transaction failed.');
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
                        <span className="text-gray-400">{network.chainType === 'bitcoin' ? 'Network Fee' : 'Gas Fee'}:</span>
                        {status === 'estimating' || fee === null ? (
                            <span className="font-mono text-sm">Estimating...</span>
                        ) : (
                            <span className="font-mono text-sm">~{fee} {network.currencySymbol}</span>
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

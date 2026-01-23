
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FiLoader, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { ERC20_ABI } from '../../utils/tokens';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const SATOSHIS_PER_BTC = 100_000_000;
const ONE_INCH_API_KEY = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY;

// --- Helper Components ---
const FeeSelector = ({ selected, onSelect, disabled, fees, currencySymbol }) => (
    <div className={`grid grid-cols-3 gap-2 rounded-lg p-1 bg-gray-900/50 ${disabled ? 'opacity-50' : ''}`}>
        {['low', 'normal', 'fast'].map(option => (
            <button key={option} onClick={() => onSelect(option)} disabled={disabled} className={`px-2 py-2 text-sm rounded-md transition-colors text-center ${selected === option ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                <div className="font-bold capitalize">{option}</div>
                <div className="text-xs font-mono mt-1">~{fees?.[option]?.fee ? parseFloat(fees[option].fee).toFixed(5) : '...'} {currencySymbol}</div>
            </button>
        ))}
    </div>
);

const StatusIndicator = ({ status, error, txHash, network }) => (
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
    </div>
);

// --- Main Component ---
const ConfirmTransactionScreen = ({ wallet, transaction, onCancel, onComplete, network, utxos }) => {
    const [status, setStatus] = useState('idle'); // idle, estimating, needs_approval, approving, confirming, sending, success, error
    const [error, setError] = useState('');
    const [txHash, setTxHash] = useState(null);
    const [feeLevel, setFeeLevel] = useState('normal');
    const [estimatedFees, setEstimatedFees] = useState(null);

    const estimateBtcFee = useCallback(async () => {
        setStatus('estimating');
        try {
            const feeRates = await axios.get(`${network.etherscanApiUrl}/fee-estimates`);
            const { fast, normal, low } = {
                fast: feeRates.data.fastestFee,
                normal: feeRates.data.halfHourFee,
                low: feeRates.data.hourFee
            };

            const inputs = utxos.length;
            const outputs = 2; // One to recipient, one for change
            const txSize = (inputs * 148) + (outputs * 34) + 10 - inputs;

            setEstimatedFees({
                low: { fee: (txSize * low) / SATOSHIS_PER_BTC, feeRate: low },
                normal: { fee: (txSize * normal) / SATOSHIS_PER_BTC, feeRate: normal },
                fast: { fee: (txSize * fast) / SATOSHIS_PER_BTC, feeRate: fast },
            });
            setStatus('confirming');
        } catch (err) {
            console.error('BTC Fee Estimation Error:', err);
            setError('Could not estimate Bitcoin fees.');
            setStatus('error');
        }
    }, [network.etherscanApiUrl, utxos]);

    // --- Gas & Fee Estimation ---
    const estimateEvmGas = useCallback(async () => {
        if (!wallet.evm?.address) return;
        setStatus('estimating');
        try {
            const provider = new ethers.JsonRpcProvider(network.rpcUrl);
            const tx = transaction.isSwap ? 
                { from: wallet.evm.address, to: transaction.toAddress, value: transaction.value, data: transaction.data } :
                { from: wallet.evm.address, to: transaction.toAddress, value: ethers.parseEther(transaction.amount) };

            const gasEst = await provider.estimateGas(tx);
            const feeData = await provider.getFeeData();
            
            let fees = {};
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) { // EIP-1559
                const calcFee = (priority) => ethers.formatEther((feeData.maxFeePerGas + priority) * gasEst);
                fees = {
                    low:    { fee: calcFee(feeData.maxPriorityFeePerGas * 80n / 100n), maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 80n / 100n, maxFeePerGas: feeData.maxFeePerGas },
                    normal: { fee: calcFee(feeData.maxPriorityFeePerGas), maxPriorityFeePerGas: feeData.maxPriorityFeePerGas, maxFeePerGas: feeData.maxFeePerGas },
                    fast:   { fee: calcFee(feeData.maxPriorityFeePerGas * 120n / 100n), maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 120n / 100n, maxFeePerGas: feeData.maxFeePerGas },
                };
            } else { // Legacy
                const calcFee = (price) => ethers.formatEther(price * gasEst);
                fees = {
                    low:    { fee: calcFee(feeData.gasPrice * 80n / 100n), gasPrice: feeData.gasPrice * 80n / 100n },
                    normal: { fee: calcFee(feeData.gasPrice), gasPrice: feeData.gasPrice },
                    fast:   { fee: calcFee(feeData.gasPrice * 120n / 100n), gasPrice: feeData.gasPrice * 120n / 100n },
                };
            }
            setEstimatedFees({ ...fees, gasLimit: gasEst });

            if (transaction.isSwap && transaction.asset.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
                 await checkAllowance(provider, fees);
            } else {
                setStatus('confirming');
            }

        } catch (err) {
            console.error("Gas/Allowance Error:", err);
            setError('Could not estimate transaction. It may not be valid.');
            setStatus('error');
        }
    }, [wallet.evm?.address, transaction, network.rpcUrl]);

     const checkAllowance = async (provider, fees) => {
        const apiBaseUrl = 'https://api.1inch.dev/swap/v5.2';
        const spenderUrl = `${apiBaseUrl}/${network.chainId}/approve/spender`;
        const allowanceUrl = `${apiBaseUrl}/${network.chainId}/approve/allowance`;

        const config = { headers: { "Authorization": `Bearer ${ONE_INCH_API_KEY}` } };

        const { data: spenderData } = await axios.get(spenderUrl, config);
        const spenderAddress = spenderData.address;

        const { data: allowanceData } = await axios.get(allowanceUrl, { ...config, params: { tokenAddress: transaction.asset.address, walletAddress: wallet.evm.address }});
        
        const allowance = BigInt(allowanceData.allowance);
        const requiredAmount = ethers.parseUnits(transaction.amount, transaction.asset.decimals);

        if (allowance < requiredAmount) {
            const approveTx = await axios.get(`${apiBaseUrl}/${network.chainId}/approve/transaction`, {
                ...config, params: { tokenAddress: transaction.asset.address, amount: requiredAmount.toString() }
            });
            setEstimatedFees({...fees, approvalTx: approveTx.data });
            setStatus('needs_approval');
        } else {
            setStatus('confirming');
        }
    };


    useEffect(() => {
        if (wallet && transaction) {
            if (network.chainType === 'evm') {
                estimateEvmGas();
            } else if (network.chainType === 'bitcoin') {
                estimateBtcFee();
            }
        }
    }, [wallet, transaction, network, estimateEvmGas, estimateBtcFee]);

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
            // onComplete is called after user closes the success screen
        } catch (err) {
            const message = err.reason || err.response?.data?.message || err.message || 'Transaction failed.';
            console.error("Transaction failed:", err);
            setError(message);
            setStatus('error');
        }
    };
    
    const handleApprove = async () => {
        setStatus('approving');
        setError('');
        try {
            const provider = new ethers.JsonRpcProvider(network.rpcUrl);
            const signer = new ethers.Wallet(wallet.privateKey, provider);
            const { gasPrice, ...approvalTx } = estimatedFees.approvalTx; // Remove gasPrice if present
            const txResponse = await signer.sendTransaction({...approvalTx, gasPrice: estimatedFees[feeLevel].gasPrice });
            await txResponse.wait(); // Wait for approval to be mined
            setStatus('confirming');
        } catch (err) {
             const message = err.reason || err.message || 'Approval failed.';
             console.error("Approval failed:", err);
             setError(message);
             setStatus('error');
        }
    };

    const handleConfirmEvm = async () => {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        const signer = new ethers.Wallet(wallet.privateKey, provider);
        
        const feeParams = estimatedFees[feeLevel];
        const txOverrides = {
            gasLimit: estimatedFees.gasLimit,
            ...(feeParams.maxFeePerGas && { maxFeePerGas: feeParams.maxFeePerGas, maxPriorityFeePerGas: feeParams.maxPriorityFeePerGas }),
            ...(!feeParams.maxFeePerGas && { gasPrice: feeParams.gasPrice }),
        };

        const finalTx = {
            to: transaction.toAddress,
            data: transaction.data,
            value: transaction.value,
            ...txOverrides
        };

        return signer.sendTransaction(finalTx);
    };

    const handleConfirmBtc = async () => {
        const btcNetwork = network.id === 'bitcoin' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
        const root = bip32.fromSeed(Buffer.from(wallet.seed, 'hex'), btcNetwork);
        const child = root.derivePath(wallet.bitcoin.path);
        const payment = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: btcNetwork });

        const amountSat = Math.floor(parseFloat(transaction.amount) * SATOSHIS_PER_BTC);
        const feeSat = Math.floor(estimatedFees[feeLevel].fee * SATOSHIS_PER_BTC);
        const totalSat = amountSat + feeSat;

        let currentSat = 0;
        const inputs = [];
        for (const utxo of utxos) {
            inputs.push({ hash: utxo.txid, index: utxo.vout, witnessUtxo: { script: payment.output, value: utxo.value }});
            currentSat += utxo.value;
            if (currentSat >= totalSat) break;
        }

        if (currentSat < totalSat) throw new Error('Insufficient funds for transaction');

        const psbt = new bitcoin.Psbt({ network: btcNetwork });
        psbt.addInputs(inputs);
        psbt.addOutput({ address: transaction.toAddress, value: amountSat });
        
        const change = currentSat - totalSat;
        if (change > 546) { // Dust threshold
            psbt.addOutput({ address: payment.address, value: change });
        }
        
        psbt.signAllInputs(child);
        psbt.finalizeAllInputs();

        const txHex = psbt.extractTransaction().toHex();
        const postResponse = await axios.post(`${network.etherscanApiUrl}/tx`, txHex);
        return { txid: postResponse.data };
    };

    const displayedFee = useMemo(() => {
        if (!estimatedFees || !feeLevel) return null;
        return estimatedFees[feeLevel]?.fee;
    }, [estimatedFees, feeLevel]);

    const renderMainContent = () => (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">Confirm {transaction.isSwap ? 'Swap' : 'Transaction'}</h2>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">{transaction.isSwap ? "From" : "Amount"}:</span>
                    <span className="font-bold text-xl">{transaction.amount} {transaction.asset.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">To:</span>
                    <span className="font-mono text-sm break-all">{transaction.toAddress}</span>
                </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Network Fee</h3>
                    <span className="font-mono text-sm">~{displayedFee ? parseFloat(displayedFee).toFixed(6) : '...'} {network.currencySymbol}</span>
                </div>
                <FeeSelector selected={feeLevel} onSelect={setFeeLevel} disabled={status === 'approving' || status === 'sending'} fees={estimatedFees} currencySymbol={network.currencySymbol} />
            </div>
            
            <div className="flex flex-col gap-4">
                 {status === 'needs_approval' && (
                     <button onClick={handleApprove} className="w-full font-bold py-4 px-6 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white transition-all">
                         Approve {transaction.asset.symbol} for Swapping
                     </button>
                 )}
                <button onClick={handleConfirm} disabled={status !== 'confirming'} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${status !== 'confirming' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                    {(status === 'sending' || status === 'approving') && <FiLoader className="animate-spin" />} 
                    {status === 'approving' ? 'Approving...' : status === 'sending' ? 'Submitting...' : 'Confirm'}
                </button>
                <button onClick={onCancel} disabled={status === 'sending' || status === 'approving'} className="w-full text-gray-400 hover:text-white transition-colors py-2 disabled:opacity-50">Cancel</button>
            </div>
        </div>
    );

    if (status === 'success' || status === 'error') {
         return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 text-white">
                <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl">
                    <StatusIndicator status={status} error={error} txHash={txHash} network={network}/>
                    <button onClick={onComplete} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors mt-6">Close</button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 text-white"
        >
            <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl">
                { (status === 'idle' || status === 'estimating') && <div className='flex items-center justify-center'><FiLoader className='animate-spin text-4xl'/></div> }
                { (status === 'confirming' || status === 'needs_approval' || status === 'approving' || status === 'sending') && renderMainContent() }
            </div>
        </motion.div>
    );
};

export default ConfirmTransactionScreen;

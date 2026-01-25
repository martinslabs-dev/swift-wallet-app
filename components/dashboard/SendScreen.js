
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { FiX, FiArrowRight, FiChevronDown, FiLoader, FiBook, FiCamera } from 'react-icons/fi';
import AddressBook from './AddressBook';
import QRCodeScanner from './QRCodeScanner';
import FeeSelector from './FeeSelector';
import { getFeeEstimates } from '../../services/feeService';

const AssetDisplay = ({ asset, balance, icon: Icon }) => (
    <div className="flex items-center">
        {Icon && <Icon className="w-6 h-6 mr-2" />}
        <div>
            <span className="font-bold">{asset}</span>
            <span className="text-gray-400 text-sm ml-2">Bal: {balance} {asset}</span>
        </div>
    </div>
);

const SendScreen = ({ onClose, onConfirm, ethBalance, tokenBalances, icons, network, activeAccount }) => {
    const [toAddress, setToAddress] = useState('');
    const [resolvedAddress, setResolvedAddress] = useState(null);
    const [isResolving, setIsResolving] = useState(false);
    const [amount, setAmount] = useState('');
    const [addressError, setAddressError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [showAddressBook, setShowAddressBook] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [feeOptions, setFeeOptions] = useState([]);
    const [selectedFee, setSelectedFee] = useState('medium');
    const [isFeeLoading, setIsFeeLoading] = useState(false);
    
    const nativeAsset = { symbol: network.currencySymbol, balance: ethBalance, isNative: true };
    const [selectedAsset, setSelectedAsset] = useState(nativeAsset);
    const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);

    useEffect(() => {
        setSelectedAsset({ symbol: network.currencySymbol, balance: ethBalance, isNative: true });
    }, [network, ethBalance]);

    useEffect(() => {
        const fetchFees = async () => {
            if (network.chainType === 'evm') { // Only for EVM networks for now
                setIsFeeLoading(true);
                try {
                    const fees = await getFeeEstimates(network.rpcUrl);
                    setFeeOptions(fees);
                } catch (error) {
                    console.error("Failed to fetch fee estimates:", error);
                    setFeeOptions([]); // Set empty or default fees
                }
                setIsFeeLoading(false);
            }
        };
        fetchFees();
    }, [network]);

    const allAssets = [
        nativeAsset,
        ...tokenBalances.map(tb => ({ ...tb, symbol: tb.symbol, balance: tb.balance }))
    ];

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setToAddress(newAddress);
        setResolvedAddress(null);
        if (addressError) setAddressError('');
    };

    const handleAddressBlur = async () => {
        if (toAddress.endsWith('.eth')) {
            setIsResolving(true);
            setAddressError('');
            try {
                const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                const resolved = await provider.resolveName(toAddress);
                if (resolved) {
                    setResolvedAddress(resolved);
                } else {
                    setAddressError('This ENS name does not resolve to an address.');
                }
            } catch (error) {
                setAddressError('Could not resolve ENS name.');
            } finally {
                setIsResolving(false);
            }
        } else if (toAddress && !ethers.isAddress(toAddress)) {
            setAddressError('Invalid Ethereum address or ENS name.');
        } else {
            setAddressError('');
        }
    };

    const handleAmountChange = (e) => {
        const newAmount = e.target.value;
        if (/^\d*\.?\d*$/.test(newAmount)) {
            setAmount(newAmount);
            if (parseFloat(newAmount) > parseFloat(selectedAsset.balance)) {
                setAmountError('Insufficient balance');
            } else {
                setAmountError('');
            }
        }
    };
    
    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
        setIsAssetSelectorOpen(false);
        if (amount && parseFloat(amount) > parseFloat(asset.balance)) {
            setAmountError('Insufficient balance');
        } else {
            setAmountError('');
        }
    };

    const handleSelectContact = (address) => {
        setToAddress(address);
        setShowAddressBook(false);
        if (addressError) setAddressError('');
    };

    const handleQRCodeScanned = (data) => {
        setToAddress(data);
        setShowQRScanner(false);
    };

    const handleSubmit = () => {
        const finalAddress = resolvedAddress || toAddress;
        if (!addressError && !amountError && finalAddress && amount && ethers.isAddress(finalAddress)) {
            const feeInfo = feeOptions.find(f => f.level === selectedFee);
            onConfirm({ toAddress: finalAddress, amount, asset: selectedAsset, fee: feeInfo });
        } else if (!ethers.isAddress(finalAddress)) {
             setAddressError('A valid address or resolved ENS name is required.');
        }
    };

    const finalAddressForValidation = resolvedAddress || toAddress;
    const isFormValid = !addressError && !amountError && finalAddressForValidation && ethers.isAddress(finalAddressForValidation) && parseFloat(amount) > 0 && !isFeeLoading;

    const SelectedAssetIcon = selectedAsset.isNative ? () => <span className="text-2xl">♦</span> : icons[selectedAsset.symbol];

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex justify-center p-6 text-white overflow-y-auto"
        >
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-900/80 py-4 z-20">
                    <h1 className="text-3xl font-bold">Send</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FiX className="text-3xl" />
                    </button>
                </div>

                <div className="space-y-6 pb-24">
                    <div className="relative z-10">
                         <label className="block text-gray-400 text-sm font-bold mb-2">Asset</label>
                        <button onClick={() => setIsAssetSelectorOpen(!isAssetSelectorOpen)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white flex items-center justify-between">
                           <AssetDisplay asset={selectedAsset.symbol} balance={selectedAsset.balance} icon={SelectedAssetIcon} />
                           <FiChevronDown />
                        </button>
                        {isAssetSelectorOpen && (
                            <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="absolute w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg z-10 overflow-hidden">
                                {allAssets.map(asset => {
                                    const AssetIcon = asset.isNative ? () => <span className="text-2xl">♦</span> : icons[asset.symbol];
                                    return (
                                        <button key={asset.symbol} onClick={() => handleSelectAsset(asset)} className="w-full text-left p-3 hover:bg-gray-700">
                                            <AssetDisplay asset={asset.symbol} balance={asset.balance} icon={AssetIcon}/>
                                        </button>
                                    )
                                })}
                            </motion.div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-400 text-sm font-bold" htmlFor="address">Recipient</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowAddressBook(true)} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                                    <FiBook />
                                    <span>Address Book</span>
                                </button>
                                <button onClick={() => setShowQRScanner(true)} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                                    <FiCamera />
                                    <span>Scan QR</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative flex items-center">
                             <input id="address" type="text" value={toAddress} onChange={handleAddressChange} onBlur={handleAddressBlur} className={`w-full bg-gray-800 border-2 ${addressError ? 'border-red-500' : 'border-gray-700'} rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-blue-500`} placeholder="Address or ENS name (e.g., vitalik.eth)" />
                             {isResolving && <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                        </div>
                        {addressError && <p className="text-red-500 text-xs mt-2">{addressError}</p>}
                        {resolvedAddress && !addressError && (
                            <p className="text-green-400 text-xs mt-2 font-mono break-all">Resolved: {resolvedAddress}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="amount">Amount</label>
                        <input id="amount" type="text" value={amount} onChange={handleAmountChange} className={`w-full bg-gray-800 border-2 ${amountError ? 'border-red-500' : 'border-gray-700'} rounded-lg p-3 text-white focus:outline-none focus:border-blue-500`} placeholder="0.0" inputMode="decimal"/>
                        {amountError && <p className="text-red-500 text-xs mt-2">{amountError}</p>}
                    </div>

                    {isFeeLoading && <div className="flex justify-center items-center p-4"><FiLoader className="animate-spin text-cyan-400" size={24}/></div>}
                    {!isFeeLoading && feeOptions.length > 0 && (
                        <FeeSelector 
                            feeOptions={feeOptions} 
                            selectedFee={selectedFee} 
                            onFeeSelect={setSelectedFee}
                            network={network}
                        />
                    )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-900/80 backdrop-blur-sm z-20">
                     <div className="w-full max-w-md mx-auto">
                        <button onClick={handleSubmit} disabled={!isFormValid} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${!isFormValid ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                            <span>Continue</span>
                            <FiArrowRight />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showAddressBook && (
                    <AddressBook 
                        onClose={() => setShowAddressBook(false)} 
                        onSelectContact={handleSelectContact} 
                        userId={activeAccount?.userId} 
                        sessionPasscode={activeAccount?.sessionPasscode} 
                    />
                )}
                {showQRScanner && (
                    <QRCodeScanner 
                        onClose={() => setShowQRScanner(false)}
                        onScan={handleQRCodeScanned}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SendScreen;

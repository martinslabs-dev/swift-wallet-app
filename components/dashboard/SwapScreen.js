
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown, FiArrowDown, FiLoader } from 'react-icons/fi';
import { ethers } from 'ethers';
import axios from 'axios';
import debounce from 'lodash.debounce';

// --- Helper Components ---

const AssetDisplay = ({ asset, icon: Icon, onSelect }) => (
    <button onClick={onSelect} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white flex items-center justify-between hover:border-blue-500 transition-colors">
        <div className="flex items-center">
            {Icon && <Icon className="w-8 h-8 mr-3 rounded-full" />}
            <div>
                <div className="font-bold text-lg">{asset.symbol}</div>
                <div className="text-gray-400 text-sm font-mono">Balance: {parseFloat(asset.balance).toFixed(4)}</div>
            </div>
        </div>
        <FiChevronDown className="text-xl" />
    </button>
);

const TokenSelector = ({ assets, onSelect, onClose, icons }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-20 flex flex-col p-4"
    >
        <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Select Token</h2>
                <button onClick={onClose}><FiX className="text-2xl" /></button>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh]">
                {assets.map(asset => {
                    const AssetIcon = asset.isNative ? () => <span className="text-3xl">♦</span> : icons[asset.symbol];
                    return (
                        <button key={asset.symbol} onClick={() => onSelect(asset)} className="w-full text-left p-3 hover:bg-gray-700 bg-gray-800 rounded-lg flex items-center gap-4">
                            {AssetIcon && <AssetIcon className="w-8 h-8 rounded-full" />}
                            <div>
                                <div className="font-semibold">{asset.symbol}</div>
                                <div className="text-sm text-gray-400">{asset.name}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

// --- Main Swap Screen Component ---

const SwapScreen = ({ onClose, onConfirm, nativeBalance, tokenBalances, icons, network }) => {
    // --- State Management ---
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [fromToken, setFromToken] = useState(null);
    const [toToken, setToToken] = useState(null);
    
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
    const [selectorMode, setSelectorMode] = useState('from'); // 'from' or 'to'

    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState('');

    const ONE_INCH_API_KEY = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY; // IMPORTANT: Add your 1inch API key to .env.local

    // --- Data Preparation ---
    const nativeAsset = useMemo(() => ({
        symbol: network.currencySymbol,
        name: network.name,
        balance: nativeBalance,
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // 1inch standard for native token
        decimals: 18,
        isNative: true,
    }), [network, nativeBalance]);

    const allAssets = useMemo(() => [nativeAsset, ...tokenBalances], [nativeAsset, tokenBalances]);

    // --- Effects ---
    useEffect(() => {
        // Set default fromToken to native asset if available
        if (!fromToken && allAssets.length > 0) {
            setFromToken(nativeAsset);
        }
    }, [allAssets, fromToken, nativeAsset]);

    const fetchQuote = async (amount) => {
        if (!fromToken || !toToken || !amount || !ONE_INCH_API_KEY) {
            setToAmount('');
            setQuote(null);
            return;
        }

        setIsFetchingQuote(true);
        setError('');

        const amountInSmallestUnit = ethers.parseUnits(amount, fromToken.decimals).toString();
        const apiBaseUrl = 'https://api.1inch.dev/swap/v5.2';
        const url = `${apiBaseUrl}/${network.chainId}/quote`;

        const config = {
            headers: { "Authorization": `Bearer ${ONE_INCH_API_KEY}` },
            params: {
                src: fromToken.address,
                dst: toToken.address,
                amount: amountInSmallestUnit,
            }
        };

        try {
            const { data } = await axios.get(url, config);
            const formattedToAmount = ethers.formatUnits(data.toAmount, toToken.decimals);
            setToAmount(formattedToAmount);
            setQuote(data);
        } catch (err) {
            console.error("1inch quote error:", err);
            const errorMsg = err.response?.data?.description || "Could not fetch a quote.";
            setError(errorMsg);
            setToAmount('');
            setQuote(null);
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const debouncedFetchQuote = useCallback(debounce(fetchQuote, 500), [fromToken, toToken, network.chainId, ONE_INCH_API_KEY]);
    
    useEffect(() => {
        if (parseFloat(fromAmount) > 0) {
            debouncedFetchQuote(fromAmount);
        } else {
            setToAmount('');
            setQuote(null);
            debouncedFetchQuote.cancel();
        }
    }, [fromAmount, fromToken, toToken, debouncedFetchQuote]);


    // --- Handlers ---
    const handleFromAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setFromAmount(value);
            if (parseFloat(value) > parseFloat(fromToken?.balance || 0)) {
                setError('Insufficient balance');
            } else {
                setError('');
            }
        }
    };

    const handleSelectToken = (token) => {
        if (selectorMode === 'from') {
            if (token.address === toToken?.address) { // Prevent selecting the same token
                setToToken(fromToken);
            }
            setFromToken(token);
        } else {
            if (token.address === fromToken?.address) {
                setFromToken(toToken);
            }
            setToToken(token);
        }
        setIsTokenSelectorOpen(false);
    };

    const handleSwapAssets = () => {
        if (!fromToken || !toToken) return;
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount); // The new "from" amount is the old "to" amount
    };
    
    const handleSwap = () => {
        if (!quote || !fromToken || error) return;
        // The `onConfirm` function expects a transaction object that `ConfirmTransactionScreen` can process.
        // We will adapt `ConfirmTransactionScreen` to handle this more complex object.
        const txDetails = {
            // This is a contract interaction, not a simple transfer.
            // `toAddress` is the 1inch router, `data` is the payload.
            toAddress: quote.tx.to, 
            amount: fromAmount, // The amount being spent
            asset: fromToken, // The asset being spent
            data: quote.tx.data, // The encoded transaction data from 1inch
            value: quote.tx.value, // Required for native token swaps
            isSwap: true, // Custom flag to identify swap transactions
        };
        onConfirm(txDetails);
    };

    // --- UI State & Components ---
    const openTokenSelector = (mode) => {
        setSelectorMode(mode);
        setIsTokenSelectorOpen(true);
    };
    
    const FromTokenIcon = fromToken?.isNative ? () => <span className="text-3xl">♦</span> : icons[fromToken?.symbol];
    const ToTokenIcon = toToken?.isNative ? () => <span className="text-3xl">♦</span> : icons[toToken?.symbol];

    const isButtonDisabled = isFetchingQuote || !quote || !!error || parseFloat(fromAmount) <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center p-4 text-white z-40"
        >
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Swap</h1>
                    <button onClick={onClose}><FiX className="text-3xl" /></button>
                </div>

                <div className="relative space-y-2">
                    {/* FROM ASSET */}
                    <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-xs text-gray-400">You Pay</span>
                        <div className="flex items-center justify-between gap-4 mt-1">
                            <input 
                                type="text" 
                                inputMode="decimal"
                                placeholder="0.0" 
                                value={fromAmount}
                                onChange={handleFromAmountChange}
                                className="bg-transparent text-white text-3xl w-full focus:outline-none" 
                            />
                            {fromToken && <AssetDisplay asset={fromToken} icon={FromTokenIcon} onSelect={() => openTokenSelector('from')} />}
                        </div>
                    </div>

                    {/* SWAP BUTTON */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button onClick={handleSwapAssets} className="bg-gray-700 rounded-full p-2 border-4 border-gray-900 hover:rotate-180 transition-transform">
                            <FiArrowDown className="text-xl" />
                        </button>
                    </div>

                    {/* TO ASSET */}
                    <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-xs text-gray-400">You Receive</span>
                        <div className="flex items-center justify-between gap-4 mt-1">
                            <input 
                                type="text"
                                inputMode="decimal"
                                placeholder="0.0" 
                                value={toAmount}
                                readOnly
                                className="bg-transparent text-gray-400 text-3xl w-full focus:outline-none" 
                            />
                            {toToken ? 
                                <AssetDisplay asset={toToken} icon={ToTokenIcon} onSelect={() => openTokenSelector('to')} /> :
                                <button onClick={() => openTokenSelector('to')} className="bg-gray-700 p-3 rounded-lg text-white font-semibold">Select Token</button>
                            }
                        </div>
                    </div>
                </div>

                {/* Status/Error Display */}
                <div className="h-10 mt-4 text-center">
                    {isFetchingQuote && <FiLoader className="animate-spin text-blue-400 mx-auto text-2xl" />}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                
                {/* Swap Button */}
                <button onClick={handleSwap} disabled={isButtonDisabled} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg mt-2 ${isButtonDisabled ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {isFetchingQuote ? 'Fetching Quote...' : 'Swap'}
                </button>
                {!ONE_INCH_API_KEY && <div className="text-center text-yellow-500 text-xs mt-2">1inch API Key not configured. Swapping is disabled.</div>}
            </div>
            
            <AnimatePresence>
                {isTokenSelectorOpen && (
                    <TokenSelector 
                        assets={allAssets} 
                        onSelect={handleSelectToken} 
                        onClose={() => setIsTokenSelectorOpen(false)}
                        icons={icons}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SwapScreen;

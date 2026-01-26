import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown, FiArrowDown } from 'react-icons/fi';
import { parseUnits, formatUnits } from 'ethers';
import debounce from 'lodash.debounce';
import { lifiService } from '../../services/lifiService';

const SwapScreen = ({ onClose, onConfirm, tokenBalances, network, activeAccount }) => {
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [fromToken, setFromToken] = useState(null);
    const [toToken, setToToken] = useState(null);
    
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
    const [selectorMode, setSelectorMode] = useState('from');

    const [isLoading, setIsLoading] = useState(false);
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState('');

    const allAssets = useMemo(() => {
        const nativeAsset = {
            symbol: network.currencySymbol,
            name: network.name,
            address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            decimals: 18, 
            balance: '0' // This will be replaced by actual balance later
        };
        return [nativeAsset, ...tokenBalances];
    }, [network, tokenBalances]);

    useEffect(() => {
        if (!fromToken && allAssets.length > 0) {
            setFromToken(allAssets[0]);
        }
    }, [allAssets, fromToken]);

    const getSwapQuote = async (amount) => {
        if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0 || !activeAccount) {
            setToAmount('');
            setQuote(null);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const amountInSmallestUnit = parseUnits(amount, fromToken.decimals).toString();

            const quoteParams = {
                fromChain: network.chainId,
                toChain: network.chainId,
                fromToken: fromToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? network.currencySymbol : fromToken.address,
                toToken: toToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? network.currencySymbol : toToken.address,
                fromAmount: amountInSmallestUnit,
                fromAddress: activeAccount.evm.address,
            };

            const quoteResult = await lifiService.getQuote(quoteParams);

            if (quoteResult.estimate && quoteResult.estimate.toAmount) {
                const formattedToAmount = formatUnits(quoteResult.estimate.toAmount, toToken.decimals);
                setToAmount(formattedToAmount);
            } else {
                setToAmount('0');
            }
            setQuote(quoteResult);

        } catch (err) {
            console.error("LI.FI quote error:", err);
            setError(err.message || "Could not fetch a quote.");
            setToAmount('');
            setQuote(null);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedGetQuote = useCallback(debounce(getSwapQuote, 500), [fromToken, toToken, network.chainId, activeAccount]);

    useEffect(() => {
        debouncedGetQuote(fromAmount);
        return () => debouncedGetQuote.cancel();
    }, [fromAmount, fromToken, toToken, debouncedGetQuote]);

    const handleFromAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setFromAmount(value);
        }
    };

    const handleSelectToken = (token) => {
        if (selectorMode === 'from') {
            setFromToken(token);
        } else {
            setToToken(token);
        }
        setIsTokenSelectorOpen(false);
    };

    const handleSwapAssets = () => {
        setFromToken(toToken);
        setToToken(fromToken);
    };

    const handleSwap = () => {
        if (!quote || !quote.transactionRequest || !fromToken || error) return;
        
        const txDetails = {
            toAddress: quote.transactionRequest.to,
            amount: fromAmount,
            asset: fromToken,
            data: quote.transactionRequest.data,
            value: quote.transactionRequest.value,
            isSwap: true,
        };
        onConfirm(txDetails);
    };

    const isButtonDisabled = isLoading || !quote || !quote.transactionRequest || !!error || parseFloat(fromAmount) <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center p-4 text-white z-40"
        >
             <div className="w-full max-w-md">
                <div className="w-full max-w-md p-4 rounded-t-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold theme-gradient-text">Swap</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">From</span>
                        <span className="text-sm text-gray-400">Balance: {fromToken?.balance || '0.00'}</span>
                    </div>
                    <div className="flex items-center">
                        <input 
                            type="text" 
                            value={fromAmount}
                            onChange={handleFromAmountChange}
                            placeholder="0.0"
                            className="bg-transparent text-3xl font-bold w-full outline-none"
                        />
                        <button onClick={() => { setSelectorMode('from'); setIsTokenSelectorOpen(true); }} className="flex items-center bg-gray-700 rounded-full p-2 ml-2">
                            <span className="font-bold mr-2">{fromToken?.symbol}</span>
                            <FiChevronDown />
                        </button>
                    </div>
                </div>

                <div className="flex justify-center my-2">
                    <button onClick={handleSwapAssets} className="p-2 bg-gray-700 rounded-full">
                        <FiArrowDown />
                    </button>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">To</span>
                    </div>
                    <div className="flex items-center">
                        <input 
                            type="text" 
                            value={toAmount}
                            readOnly
                            placeholder="0.0"
                            className="bg-transparent text-3xl font-bold w-full outline-none"
                        />
                        <button onClick={() => { setSelectorMode('to'); setIsTokenSelectorOpen(true); }} className="flex items-center bg-gray-700 rounded-full p-2 ml-2">
                             <span className="font-bold mr-2">{toToken?.symbol || 'Select'}</span>
                            <FiChevronDown />
                        </button>
                    </div>
                </div>
                
                <button onClick={handleSwap} disabled={isButtonDisabled} className={`w-full font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg mt-2 ${isButtonDisabled ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {isLoading ? 'Fetching Quote...' : 'Swap'}
                </button>
            </div>

            <AnimatePresence>
                {isTokenSelectorOpen && (
                    <TokenSelector 
                        isOpen={isTokenSelectorOpen}
                        onClose={() => setIsTokenSelectorOpen(false)}
                        tokens={allAssets}
                        onSelectToken={handleSelectToken}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const TokenSelector = ({ isOpen, onClose, tokens, onSelectToken }) => (
    <motion.div 
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        className="absolute inset-0 bg-gray-900 p-4"
    >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold theme-gradient-text">Select Token</h2>
            <button onClick={onClose}><FiX size={24} /></button>
        </div>
        <div className="flex flex-col gap-2">
            {tokens.map(token => (
                <button 
                    key={token.address}
                    onClick={() => onSelectToken(token)}
                    className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                    <span className="text-xl font-bold">{token.symbol}</span>
                    <span className="text-gray-400 ml-4">{token.name}</span>
                </button>
            ))}
        </div>
    </motion.div>
);


export default SwapScreen;
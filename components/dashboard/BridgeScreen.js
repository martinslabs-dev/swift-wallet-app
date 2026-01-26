
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { FiArrowRight } from 'react-icons/fi';
import debounce from 'lodash.debounce';

import { lifiService } from '../../services/lifiService';
import { useNetwork } from '../../context/NetworkContext';
import { parseUnits, formatUnits } from "ethers";

const Spinner = () => <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>;

const CrossChainSwapView = ({ activeAccount, onConfirm }) => {
    const { networks } = useNetwork();
    
    const [lifiChains, setLifiChains] = useState([]);
    const [fromTokens, setFromTokens] = useState([]);
    const [toTokens, setToTokens] = useState([]);

    const [fromChain, setFromChain] = useState(null);
    const [toChain, setToChain] = useState(null);
    const [fromToken, setFromToken] = useState(null);
    const [toToken, setToToken] = useState(null);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');

    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChains = async () => {
            try {
                const chains = await lifiService.getChains();
                const supportedChains = chains.map(c => ({ value: c.id, label: c.name, ...c }));
                setLifiChains(supportedChains);

                const activeChainId = networks.find(n => n.name.toLowerCase() === activeAccount.network.toLowerCase())?.chainId;
                const activeLifiChain = supportedChains.find(c => c.id === activeChainId);
                
                if (activeLifiChain) {
                    setFromChain(activeLifiChain);
                    const defaultToChain = supportedChains.find(c => c.id !== activeChainId);
                    if (defaultToChain) setToChain(defaultToChain);
                }

            } catch (err) {
                setError('Could not load supported chains.');
            }
        };
        if(activeAccount) fetchChains();
    }, [activeAccount, networks]);

    useEffect(() => {
        const fetchTokensForChain = async (chain, setTokensCallback, setTokenCallback) => {
            if (!chain) return;
            try {
                const tokensResponse = await lifiService.getTokens([chain.value]);
                const tokensForChain = tokensResponse[chain.value] || [];
                const formattedTokens = tokensForChain.map(t => ({ value: t.address, label: `${t.name} (${t.symbol})`, ...t }));
                setTokensCallback(formattedTokens);

                const nativeToken = formattedTokens.find(t => t.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
                if (nativeToken) {
                    setTokenCallback(nativeToken);
                } else if (formattedTokens.length > 0) {
                    setTokenCallback(formattedTokens[0]);
                }

            } catch (err) {
                setError(`Could not load tokens for ${chain.label}.`);
                setTokensCallback([]);
            }
        };

        if (fromChain) {
            fetchTokensForChain(fromChain, setFromTokens, setFromToken);
        }
        if (toChain) {
            fetchTokensForChain(toChain, setToTokens, setToToken);
        }
    }, [fromChain, toChain]);

    const getSwapQuote = async (amount) => {
        if (!fromChain || !toChain || !fromToken || !toToken || !amount || !activeAccount) return;
        setIsFetchingQuote(true);
        setError('');
        setQuote(null);

        try {
            const amountInSmallestUnit = parseUnits(amount, fromToken.decimals).toString();
            const params = {
                fromChain: fromChain.value,
                toChain: toChain.value,
                fromToken: fromToken.value,
                toToken: toToken.value,
                fromAmount: amountInSmallestUnit,
                fromAddress: activeAccount.address, // Assuming EVM address
            };
            const result = await lifiService.getQuote(params);
            setQuote(result);
            if(result.estimate.toAmount) {
                setToAmount(formatUnits(result.estimate.toAmount, result.action.toToken.decimals));
            }
        } catch (err) {
            setError(err.message || 'Could not fetch quote.');
            setToAmount('');
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const debouncedGetQuote = useCallback(debounce(getSwapQuote, 800), [fromChain, toChain, fromToken, toToken, activeAccount]);

    useEffect(() => {
        debouncedGetQuote(fromAmount);
        return () => debouncedGetQuote.cancel();
    }, [fromAmount, debouncedGetQuote]);

    const handleBridge = () => {
        if (!quote || !quote.transactionRequest) return;
        onConfirm({ ...quote, isBridge: true });
    };
    
    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setFromAmount(value);
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-5 items-center gap-2">
                <div className="col-span-2">
                    <label className="text-gray-300 mb-1 block">From</label>
                    <Select options={lifiChains} value={fromChain} onChange={setFromChain} />
                </div>
                <div className="col-span-1 text-center pt-6"><FiArrowRight size={20} className="mx-auto"/></div>
                <div className="col-span-2">
                    <label className="text-gray-300 mb-1 block">To</label>
                    <Select options={lifiChains} value={toChain} onChange={setToChain} />
                </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
                <label className="text-gray-300 text-xs">You Send</label>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2/5">
                        <Select options={fromTokens} value={fromToken} onChange={setFromToken} />
                    </div>
                    <input type="text" value={fromAmount} onChange={handleAmountChange} placeholder="0.0" className="bg-gray-900 border border-gray-700 rounded-md p-2 w-3/5 text-right text-lg"/>
                </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
                <label className="text-gray-300 text-xs">You Receive (Estimated)</label>
                 <div className="flex items-center gap-2 mt-1">
                    <div className="w-2/5">
                        <Select options={toTokens} value={toToken} onChange={setToToken} />
                    </div>
                    <input type="text" value={toAmount} readOnly placeholder="0.0" className="bg-gray-900 border border-gray-700 rounded-md p-2 w-3/5 text-right text-lg"/>
                </div>
            </div>

            {error && <p className="text-red-400 text-xs text-center p-2 bg-red-900/50 rounded-md">{error}</p>}
            
            {quote && quote.estimate && (
                 <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded-md space-y-1">
                    <div className="flex justify-between"><span>Gas Cost:</span> <span>~${quote.estimate.gasCosts[0].amountUSD}</span></div>
                    <div className="flex justify-between"><span>Est. Time:</span> <span>{Math.round(quote.estimate.executionDuration / 60)} min</span></div>
                    {quote.toolDetails && <div className="flex justify-between"><span>Provider:</span> <span className="capitalize">{quote.toolDetails.name}</span></div>}
                 </div>
            )}

            <button onClick={handleBridge} disabled={!quote || isFetchingQuote || !fromAmount} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-700 disabled:text-gray-400 flex justify-center items-center transition-all">
                {isFetchingQuote ? <Spinner /> : 'Review Bridge'}
            </button>
        </div>
    );
};

const BridgeScreen = ({ activeAccount, onConfirm }) => {
    if (!activeAccount) {
        return <div className="p-8 text-center text-gray-400">Please select an active account to begin.</div>
    }

    return (
        <div className="w-full max-w-md mx-auto h-full flex flex-col bg-gray-900/50 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold text-center">Bridge & Swap</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                <CrossChainSwapView 
                    activeAccount={activeAccount}
                    onConfirm={onConfirm}
                />
            </div>
        </div>
    );
};

export default BridgeScreen;

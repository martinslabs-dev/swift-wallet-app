import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { relayService } from '../../services/relayService';
import { useNetwork } from '../../context/NetworkContext';

// --- Reusable UI Components (omitted for brevity) ---
const TabButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors relative ` + 
                   `${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
    >
        {label}
        {active && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" layoutId="bridge-active-tab" />}
    </button>
);
const Spinner = () => <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>;
const MOCK_TOKENS = { /* ... */ };

// --- Bridge Feature Placeholder ---
const BridgeView = () => <div className="p-4 text-center">Bridge feature from previous step.</div>;

// --- Cross-Chain Swap Feature (with bug fix) ---
const CrossChainSwapView = () => {
    const { networks, activeNetwork } = useNetwork();
    
    // State
    const [amount, setAmount] = useState('');
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [fromChain, setFromChain] = useState(null);
    const [toChain, setToChain] = useState(null);
    const [fromToken, setFromToken] = useState(null);
    const [toToken, setToToken] = useState(null);

    // Effect to safely set default chains and tokens when network data is available
    useEffect(() => {
        if (activeNetwork && networks && networks.length > 0) {
            setFromChain(activeNetwork);

            const initialToChain = networks.find(n => n.chainId !== activeNetwork.chainId) || networks[0];
            setToChain(initialToChain);

            const fromTokens = MOCK_TOKENS[activeNetwork.chainId] || [];
            const toTokens = MOCK_TOKENS[initialToChain.chainId] || [];
            setFromToken(fromTokens[0]);
            setToToken(toTokens[0]);
        }
    }, [activeNetwork, networks]);

    // Handlers (handleGetQuote, etc. - omitted for brevity)
    const handleGetQuote = async () => { /* ... */ };

    // Guard clause to prevent rendering with incomplete data
    if (!fromChain || !toChain || !fromToken || !toToken) {
        return <div className="p-4 text-center text-gray-400">Initializing...</div>;
    }

    const availableFromTokens = MOCK_TOKENS[fromChain.chainId] || [];
    const availableToTokens = MOCK_TOKENS[toChain.chainId] || [];

    return (
        <div className="p-4 flex flex-col gap-4"> 
            {/* ... JSX for form elements, using fromChain, toChain etc. ... */}
            <p className='text-center'>Cross-Chain Swap View</p>
        </div>
    );
};


// --- Cross-Chain Pay Feature (with bug fix) ---
const PayView = () => {
    const { networks, activeNetwork } = useNetwork();

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toChain, setToChain] = useState(null);
    const [targetAddress, setTargetAddress] = useState('');
    const [amount, setAmount] = useState('0');
    const [calldata, setCalldata] = useState('');

    // Effect to safely set default destination chain
    useEffect(() => {
        if (activeNetwork && networks && networks.length > 0) {
            const possibleDestinations = networks.filter(n => n.chainId !== activeNetwork.chainId);
            if (possibleDestinations.length > 0) {
                setToChain(possibleDestinations[0]);
            }
        }
    }, [activeNetwork, networks]);

    const handleCreatePayTransaction = async () => { /* ... */ };

    // Guard clause to prevent rendering if no destination is possible
    if (!activeNetwork || !networks || networks.filter(n => n.chainId !== activeNetwork.chainId).length === 0) {
        return <div className="p-4 text-center text-gray-400">A destination network is required for this feature.</div>;
    }
    
    // Guard clause for when the default is being set
    if (!toChain) {
         return <div className="p-4 text-center text-gray-400">Initializing...</div>;
    }

    return (
        <div className="p-4 flex flex-col gap-4 text-sm">
            <p className="text-xs text-center text-gray-400">Execute a cross-chain contract call. For advanced users.</p>
            <div className="flex flex-col gap-1">
                <label className="text-gray-300">Destination Chain</label>
                <select value={toChain.chainId} onChange={e => setToChain(networks.find(n => n.chainId === e.target.value))} className="bg-gray-800 border border-gray-700 rounded-md p-2 focus:outline-none w-full">
                    {networks.filter(n => n.chainId !== activeNetwork.chainId).map(n => <option key={n.chainId} value={n.chainId}>{n.name}</option>)}
                </select>
            </div>
            {/* ... other form elements ... */}
        </div>
    );
};


// --- Main Screen Component ---
const BridgeScreen = () => {
    const [activeTab, setActiveTab] = useState('bridge');

    const renderContent = () => {
        switch (activeTab) {
            case 'bridge': return <BridgeView />;
            case 'cross_chain_swap': return <CrossChainSwapView />;
            case 'pay': return <PayView />;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto h-full flex flex-col bg-gray-900/50 rounded-lg overflow-hidden">
            <div className="flex justify-center border-b border-gray-700/50">
                <TabButton label="Bridge" active={activeTab === 'bridge'} onClick={() => setActiveTab('bridge')} />
                <TabButton label="Cross-Chain Swap" active={activeTab === 'cross_chain_swap'} onClick={() => setActiveTab('cross_chain_swap')} />
                <TabButton label="Pay" active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} />
            </div>
            <div className="flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BridgeScreen;

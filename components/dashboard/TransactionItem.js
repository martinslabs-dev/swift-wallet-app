
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FiCheckCircle, FiAlertTriangle, FiLoader, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';

const TransactionItem = ({ tx, currentUserAddress, network }) => {
    const [displayName, setDisplayName] = useState('');
    
    const isSent = tx.from.toLowerCase() === currentUserAddress.toLowerCase();
    const otherAddress = isSent ? tx.to : tx.from;
    const timeAgo = tx.timeStamp ? formatDistanceToNow(new Date(tx.timeStamp * 1000), { addSuffix: true }) : 'Pending';
    const explorerTxUrl = `${network.explorerUrl}/${network.chainType === 'solana' ? 'tx' : 'tx'}/${tx.hash}`;
    const isClickable = tx.hash && tx.status !== 'pending';

    useEffect(() => {
        const resolveName = async () => {
            if (network.chainType === 'evm' && otherAddress) {
                try {
                    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                    const name = await provider.lookupAddress(otherAddress);
                    setDisplayName(name || `${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`);
                } catch (error) {
                    setDisplayName(`${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`);
                }
            } else if (otherAddress) {
                setDisplayName(`${otherAddress.substring(0, 4)}...${otherAddress.substring(otherAddress.length - 4)}`);
            }
        };
        
        if(otherAddress) resolveName();
    }, [otherAddress, network.rpcUrl, network.chainType]);

    const renderStatusIcon = () => {
        const baseClass = "w-4 h-4";
        if (tx.status === 'pending') return <FiLoader className={`${baseClass} animate-spin text-yellow-400`} />;
        if (tx.status === 'failed') return <FiAlertTriangle className={`${baseClass} text-red-400`} />;
        return <FiCheckCircle className={`${baseClass} text-green-400`} />;
    }

    const formatValue = (tx) => {
        const symbol = tx.tokenSymbol || network.currencySymbol;
        const decimals = tx.tokenDecimal || 18;
        try {
            const valueString = ethers.formatUnits(tx.value, decimals);
            return `${parseFloat(valueString).toPrecision(4)} ${symbol}`;
        } catch { return `0 ${symbol}`; }
    };

    const txValueDisplay = formatValue(tx);

    return (
        <motion.a 
            href={isClickable ? explorerTxUrl : undefined}
            target="_blank" 
            rel="noopener noreferrer"
            className={`block p-3.5 rounded-xl transition-colors duration-200 bg-slate-900/40 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/80 ${isClickable ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-800/70`}>
                        {isSent ? <PaperAirplaneIcon className="w-5 h-5 text-slate-300" /> : <ArrowDownTrayIcon className="w-5 h-5 text-slate-300" />}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-100">{isSent ? 'Send' : 'Receive'}</p>
                        <p className="text-sm text-slate-400 font-mono" title={otherAddress}>
                            {isSent ? 'To: ' : 'From: '}{displayName}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className={`font-medium text-slate-100`}>
                       {isSent ? '-' : '+'}{txValueDisplay}
                    </p>
                   <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mt-1">
                       {renderStatusIcon()}
                       <span>{timeAgo}</span>
                       {isClickable && <FiExternalLink size={12} className="opacity-60 hover:opacity-100"/>}
                   </div>
                </div>
            </div>
        </motion.a>
    );
};

export default TransactionItem;


import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FiArrowUp, FiArrowDown, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const TransactionItem = ({ tx, currentUserAddress, network }) => {
    const [displayName, setDisplayName] = useState('');
    
    // Determine direction and the other party's address
    const isSent = tx.from.toLowerCase() === currentUserAddress.toLowerCase();
    const otherAddress = isSent ? tx.to : tx.from;

    // Format the timestamp
    const timeAgo = tx.timeStamp ? formatDistanceToNow(new Date(tx.timeStamp * 1000), { addSuffix: true }) : 'just now';

    // Generate the correct explorer URL based on the network type
    const explorerTxUrl = `${network.explorerUrl}/${network.chainType === 'solana' ? 'tx' : 'tx'}/${tx.hash}`;
    const isClickable = tx.hash && tx.status !== 'pending' && tx.status !== 'failed';

    useEffect(() => {
        const resolveName = async () => {
            // Only try to resolve ENS names for EVM chains
            if (network.chainType === 'evm' && otherAddress) {
                try {
                    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                    const name = await provider.lookupAddress(otherAddress);
                    if (name) {
                        setDisplayName(name);
                    } else {
                        setDisplayName(`${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`);
                    }
                } catch (error) {
                    setDisplayName(`${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`);
                }
            } else if (otherAddress) {
                // For Solana and other non-EVM chains, just format the address
                setDisplayName(`${otherAddress.substring(0, 4)}...${otherAddress.substring(otherAddress.length - 4)}`);
            }
        };
        
        resolveName();
    }, [otherAddress, network.rpcUrl, network.chainType]);

    const renderStatus = () => {
        if (tx.status === 'pending') {
            return <div className="flex items-center gap-2 text-yellow-400"><FiLoader className="animate-spin"/><span>Pending...</span></div>;
        }
        if (tx.status === 'failed') {
            return <div className="flex items-center gap-2 text-red-500"><FiAlertTriangle /><span>Failed</span></div>;
        }
        // For Solana, a successful status from the RPC is definitive.
        if (tx.status === 'success' || tx.confirmationStatus === 'finalized') {
            return <p className="text-gray-500 text-sm">{timeAgo}</p>;
        }
        // Default for EVM transactions without a custom status (assumed successful)
        return <p className="text-gray-500 text-sm">{timeAgo}</p>;
    }

    const formatValue = () => {
        let value = tx.value || '0';
        let symbol = network.currencySymbol;

        // For EVM, the value is in Wei and needs to be formatted
        if (network.chainType === 'evm') {
            // The value might be a BigNumber from a pending TX, so we use toString()
            return `${parseFloat(ethers.formatEther(value.toString())).toFixed(4)} ${symbol}`;
        }
        
        // For Solana, the value is already in SOL from our service
        return `${parseFloat(value).toFixed(4)} ${symbol}`;
    };

    const Wrapper = isClickable ? 'a' : 'div';
    const wrapperProps = isClickable ? { href: explorerTxUrl, target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
        <Wrapper {...wrapperProps} className={`block glass-card-secondary p-4 rounded-lg ${isClickable ? 'hover:bg-gray-700/60' : 'opacity-70'} transition-colors duration-200`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isSent ? 'bg-blue-600/30' : 'bg-green-600/30'}`}>
                        {isSent ? <FiArrowUp className="text-blue-400" /> : <FiArrowDown className="text-green-400" />}
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg">{isSent ? 'Sent' : 'Received'}</p>
                        <p className="text-gray-400 text-sm font-mono" title={otherAddress}>{displayName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`font-bold text-lg ${isSent ? 'text-blue-400' : 'text-green-400'}`}>
                        {formatValue()}
                    </p>
                   {renderStatus()}
                </div>
            </div>
        </Wrapper>
    );
};

export default TransactionItem;

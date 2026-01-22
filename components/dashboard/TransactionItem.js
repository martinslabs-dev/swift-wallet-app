
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FiArrowUp, FiArrowDown, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const TransactionItem = ({ tx, currentUserAddress, network }) => {
    const [displayName, setDisplayName] = useState('');
    const isSent = tx.from.toLowerCase() === currentUserAddress.toLowerCase();
    const otherAddress = isSent ? tx.to : tx.from;
    
    // Handle custom status for pending/failed transactions
    const timeAgo = tx.status ? '' : formatDistanceToNow(new Date(tx.timeStamp * 1000), { addSuffix: true });

    const explorerTxUrl = `${network.explorerUrl}/tx/${tx.hash}`;
    // A transaction is clickable if it has a hash and is not pending/failed
    const isClickable = tx.hash && tx.status !== 'pending' && tx.status !== 'failed';

    useEffect(() => {
        const resolveName = async () => {
            try {
                // Ethers v6 syntax
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
        };

        if (otherAddress) {
            resolveName();
        }
    }, [otherAddress, network.rpcUrl]);

    const renderStatus = () => {
        if (tx.status === 'pending') {
            return (
                <div className="flex items-center gap-2 text-yellow-400">
                    <FiLoader className="animate-spin"/>
                    <span>Sending...</span>
                </div>
            );
        }
        if (tx.status === 'failed') {
            return (
                <div className="flex items-center gap-2 text-red-500">
                    <FiAlertTriangle />
                    <span>Failed</span>
                </div>
            );
        }
        return <p className="text-gray-500 text-sm">{timeAgo}</p>;
    }

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
                        {/* The value might be a BigNumber from the pending TX, format it */}
                        {parseFloat(ethers.formatEther(tx.value.toString())).toFixed(4)} {network.currencySymbol}
                    </p>
                   {renderStatus()}
                </div>
            </div>
        </Wrapper>
    );
};

export default TransactionItem;

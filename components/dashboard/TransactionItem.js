
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const TransactionItem = ({ tx, currentUserAddress, network }) => {
    const [displayName, setDisplayName] = useState('');

    const isSent = tx.from.toLowerCase() === currentUserAddress.toLowerCase();
    const otherAddress = isSent ? tx.to : tx.from;
    const timeAgo = formatDistanceToNow(new Date(tx.timeStamp * 1000), { addSuffix: true });

    const explorerTxUrl = `${network.explorerUrl}/tx/${tx.hash}`;

    useEffect(() => {
        const resolveName = async () => {
            try {
                // Use the RPC URL from the current network
                const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
                const name = await provider.lookupAddress(otherAddress);
                if (name) {
                    setDisplayName(name);
                } else {
                    setDisplayName(`${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`);
                }
            } catch (error) {
                // Fallback to short address on error
                setDisplayName(`${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`);
            }
        };

        if (otherAddress) {
            resolveName();
        }
        // Re-run if the address or network changes
    }, [otherAddress, network.rpcUrl]);

    return (
        <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer" className="block glass-card-secondary p-4 rounded-lg hover:bg-gray-700/60 transition-colors duration-200">
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
                        {/* Display with native currency symbol */}
                        {parseFloat(tx.value).toFixed(4)} {network.currencySymbol}
                    </p>
                    <p className="text-gray-500 text-sm">{timeAgo}</p>
                </div>
            </div>
        </a>
    );
};

export default TransactionItem;

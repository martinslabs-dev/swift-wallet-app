import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// A generic, visually distinct icon for unknown tokens
const GenericTokenIcon = ({ symbol }) => (
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-sm">
        {symbol?.charAt(0).toUpperCase() || '?'}
    </div>
);

const AssetListItem = ({ token }) => {
    const hasBalance = parseFloat(token.balance) > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${hasBalance ? 'hover:bg-gray-800/50' : 'opacity-50'}`}
        >
            <div className="flex items-center gap-4">
                {token.logoURI ? (
                    <Image 
                        src={token.logoURI} 
                        alt={`${token.name} logo`} 
                        width={40} 
                        height={40} 
                        className="rounded-full" 
                        onError={(e) => { 
                            // Replace with generic icon on error
                            e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // 1x1 transparent gif
                            e.currentTarget.parentElement.innerHTML = `<div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-sm">${token.symbol?.charAt(0).toUpperCase() || '?'}</div>`;
                        }} 
                    />
                ) : (
                    <GenericTokenIcon symbol={token.symbol} />
                )}
                <div>
                    <p className="font-bold text-white">{token.name}</p>
                    <p className="text-sm text-gray-400">{token.symbol}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-white">{token.balance}</p>
                {/* Placeholder for value in USD - requires price feed */}
                <p className="text-sm text-gray-500">$0.00</p> 
            </div>
        </motion.div>
    );
};

export default AssetListItem;

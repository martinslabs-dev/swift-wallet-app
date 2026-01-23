
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiEyeOff } from 'react-icons/fi';

// A generic, visually distinct icon for unknown tokens
const GenericTokenIcon = ({ symbol }) => (
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-sm">
        {symbol?.charAt(0).toUpperCase() || '?'}
    </div>
);

const AssetListItem = ({ token, onHide }) => {
    const [isHovered, setIsHovered] = useState(false);
    const hasBalance = parseFloat(token.balance) > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`relative flex items-center justify-between p-4 rounded-lg transition-colors ${hasBalance ? 'hover:bg-gray-800/50' : 'opacity-60'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-4">
                {token.logoURI ? (
                    <Image 
                        src={token.logoURI} 
                        alt={`${token.name} logo`} 
                        width={40} 
                        height={40} 
                        className="rounded-full" 
                        unoptimized // Recommended for external image URLs in Next.js
                        onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
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
                <p className="font-bold text-white">{parseFloat(token.balance).toFixed(4)}</p>
                {/* Placeholder for value in USD - requires price feed */}
                <p className="text-sm text-gray-500">$0.00</p> 
            </div>

            {isHovered && (
                 <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click-through
                        onHide();
                    }}
                    className="absolute top-1/2 right-2 -translate-y-1/2 p-2 bg-gray-700/80 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm"
                    aria-label={`Hide ${token.name}`}
                >
                    <FiEyeOff size={16}/>
                </motion.button>
            )}
        </motion.div>
    );
};

export default AssetListItem;

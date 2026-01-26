
import React from 'react';
import { motion } from 'framer-motion';
import CryptoIcon from '../ui/CryptoIcon';

const TokenListItem = ({ token, network, onTokenClick }) => {
    // Helper to format large numbers (e.g., market cap)
    const formatMarketCap = (cap) => {
        if (!cap) return 'N/A';
        if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(2)}B`;
        if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}M`;
        return `$${cap.toFixed(2)}`;
    };

    const priceChangeColor = token.price_change_24h < 0 ? 'text-red-500' : 'text-green-500';
    const formattedPrice = token.price ? `$${parseFloat(token.price).toFixed(2)}` : 'N/A';

    return (
        <motion.div
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-2 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => onTokenClick(token)}
        >
            <div className="flex items-center">
                <CryptoIcon token={token} network={network} size={40} />
                <div className="ml-4">
                    <p className="font-bold text-lg">{token.name}</p>
                    <p className="text-gray-400 text-sm">{formatMarketCap(token.market_cap)}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">{formattedPrice}</p>
                <p className={`${priceChangeColor} text-sm`}>
                    {token.price_change_24h ? `${token.price_change_24h.toFixed(2)}%` : 'N/A'}
                </p>
            </div>
        </motion.div>
    );
};

export default TokenListItem;

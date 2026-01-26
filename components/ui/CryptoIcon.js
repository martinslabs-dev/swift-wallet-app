
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Base URL for Trust Wallet assets
const TRUST_WALLET_BASE_URL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains';

// Mapping for network names to Trust Wallet's path names
const networkPathMap = {
    'ethereum': 'ethereum',
    'solana': 'solana',
    'bitcoin': 'bitcoin',
    'binance': 'smartchain', // BNB Smart Chain
    // Add other networks as needed
};

const CryptoIcon = ({ token, network, size = 40 }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
        let path = '';

        if (token.logo) {
            setImgSrc(token.logo);
            return;
        }

        const networkPath = networkPathMap[network.id] || network.id;
        
        if (token.address) {
            // For tokens with a contract address
            path = `${TRUST_WALLET_BASE_URL}/${networkPath}/assets/${token.address}/logo.png`;
        } else if (token.symbol) {
            // For native assets like BTC, ETH
            const assetName = token.symbol.toUpperCase();
            // A common convention is to have a folder for the native asset info
            path = `${TRUST_WALLET_BASE_URL}/${networkPath}/info/logo.png`;
        }
        
        setImgSrc(path);
    }, [token, network]);

    const handleError = () => {
        // Fallback for when the image can't be loaded
        setError(true);
    };

    const fallbackSymbol = token.symbol ? token.symbol.charAt(0).toUpperCase() : '?';

    return (
        <motion.div
            className="rounded-full flex items-center justify-center bg-gray-700"
            style={{ width: size, height: size }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {error || !imgSrc ? (
                <span className="text-white font-bold" style={{ fontSize: size * 0.5 }}>
                    {fallbackSymbol}
                </span>
            ) : (
                <img
                    src={imgSrc}
                    alt={`${token.name} logo`}
                    onError={handleError}
                    className="rounded-full"
                    style={{ width: size, height: size }}
                />
            )}
        </motion.div>
    );
};

export default CryptoIcon;

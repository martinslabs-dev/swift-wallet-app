
import React from 'react';
import { motion } from 'framer-motion';
import TokenListItem from './TokenListItem';
import Link from 'next/link';

const TokenList = ({
    tokens,
    onTokenClick,
    isLoading,
    showBrowseCrypto = false,
    onManageTokens,
    network,
    error,
}) => {

    const handleTokenClick = (token) => {
        if (onTokenClick) {
            onTokenClick(token);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center p-8 text-slate-400">
                <p>Loading...</p>
            </div>
        );
    }

    if (tokens.length === 0 && !showBrowseCrypto) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400 mb-4">You don't have any tokens.</p>
                <button
                    onClick={onManageTokens}
                    className="theme-gradient-text font-semibold hover:underline focus:outline-none"
                >
                    Manage tokens
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {tokens.map((token, index) => (
                <motion.div
                    key={token.id || `${token.address}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <TokenListItem
                        token={token}
                        network={token.network || network}
                        onTokenClick={() => handleTokenClick(token)}
                    />
                </motion.div>
            ))}
            {showBrowseCrypto && (
                <div className="text-center mt-4">
                    <Link href="/browse-crypto" className="theme-gradient-text hover:underline">
                        Browse Crypto
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TokenList;

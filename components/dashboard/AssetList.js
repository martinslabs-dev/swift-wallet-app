
import React from 'react';
import AssetListItem from './AssetListItem';
import { AnimatePresence } from 'framer-motion';

const AssetList = ({ tokens, onHideToken }) => {
    if (!tokens || tokens.length === 0) {
        return (
            <div className="text-center py-4 text-gray-400">
                <p>No token balances found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {tokens.map((token) => (
                    <AssetListItem 
                        key={token.address || token.symbol} 
                        token={token} 
                        onHide={() => onHideToken(token.address)} 
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default AssetList;

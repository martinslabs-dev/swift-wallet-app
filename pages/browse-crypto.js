
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cryptoDataService } from '../services/cryptoDataService';
import TokenListItem from '../components/dashboard/TokenListItem';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { FiSearch } from 'react-icons/fi';

const BrowseCryptoPage = () => {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTokenData = async () => {
            setIsLoading(true);
            try {
                const marketData = await cryptoDataService.getTopTokens();
                const tokenData = marketData.map(data => ({
                    id: data.id,
                    symbol: data.symbol.toUpperCase(),
                    name: data.name,
                    price: data.current_price,
                    market_cap: data.market_cap,
                    price_change_24h: data.price_change_percentage_24h,
                    network: { id: data.id, name: data.name, symbol: data.symbol },
                }));
                setTokens(tokenData);
            } catch (error) {
                console.error("Failed to fetch top token market data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTokenData();
        const storedFavorites = localStorage.getItem('favorite_tokens');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    const toggleFavorite = (tokenId) => {
        let updatedFavorites;
        if (favorites.includes(tokenId)) {
            updatedFavorites = favorites.filter(id => id !== tokenId);
        } else {
            updatedFavorites = [...favorites, tokenId];
        }
        setFavorites(updatedFavorites);
        localStorage.setItem('favorite_tokens', JSON.stringify(updatedFavorites));
    };

    const filteredTokens = useMemo(() => {
        if (!searchTerm) return tokens;
        return tokens.filter(token => 
            token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tokens, searchTerm]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-4 text-center">Browse Crypto</h1>

            {/* Search Bar */}
            <div className="mb-8 max-w-lg mx-auto">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search for a cryptocurrency..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-transparent rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center"><p>Loading Market Data...</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTokens.map((token, index) => (
                        <motion.div
                            key={token.id}
                            className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-between"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.02 }}
                        >
                            <TokenListItem token={token} network={token.network} />
                            <button onClick={() => toggleFavorite(token.id)} className="ml-4">
                                {favorites.includes(token.id) ? (
                                    <SolidStarIcon className="h-6 w-6 text-yellow-400" />
                                ) : (
                                    <StarIcon className="h-6 w-6 text-gray-400" />
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseCryptoPage;

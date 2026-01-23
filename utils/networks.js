
import * as bitcoin from 'bitcoinjs-lib';

export const NETWORKS = {
    mainnet: {
        id: 'mainnet',
        name: 'Ethereum',
        chainType: 'evm',
        chainId: 1,
        rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
        explorerUrl: 'https://etherscan.io',
        currencySymbol: 'ETH',
        etherscanApiUrl: 'https://api.etherscan.io/api',
    },
    sepolia: {
        id: 'sepolia',
        name: 'Sepolia',
        chainType: 'evm',
        chainId: 11155111,
        rpcUrl: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
        explorerUrl: 'https://sepolia.etherscan.io',
        currencySymbol: 'SepoliaETH',
        etherscanApiUrl: 'https://api-sepolia.etherscan.io/api',
    },
    polygon: {
        id: 'polygon',
        name: 'Polygon',
        chainType: 'evm',
        chainId: 137,
        rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
        explorerUrl: 'https://polygonscan.com',
        currencySymbol: 'MATIC',
        etherscanApiUrl: 'https://api.polygonscan.com/api',
    },
    arbitrum: {
        id: 'arbitrum',
        name: 'Arbitrum',
        chainType: 'evm',
        chainId: 42161,
        rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
        explorerUrl: 'https://arbiscan.io',
        currencySymbol: 'ETH',
        etherscanApiUrl: 'https://api.arbiscan.io/api',
    },
    bsc: {
        id: 'bsc',
        name: 'BNB Smart Chain',
        chainType: 'evm',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorerUrl: 'https://bscscan.com',
        currencySymbol: 'BNB',
        etherscanApiUrl: 'https://api.bscscan.com/api',
    },
    avalanche: {
        id: 'avalanche',
        name: 'Avalanche',
        chainType: 'evm',
        chainId: 43114,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        explorerUrl: 'https://snowtrace.io',
        currencySymbol: 'AVAX',
        etherscanApiUrl: 'https://api.snowtrace.io/api',
    },
    solana: {
        id: 'solana',
        name: 'Solana',
        chainType: 'solana',
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        explorerUrl: 'https://explorer.solana.com',
        currencySymbol: 'SOL',
        etherscanApiUrl: null, // Solana uses a different API structure
    },
    bitcoin: {
        id: 'bitcoin',
        name: 'Bitcoin',
        chainType: 'bitcoin',
        rpcUrl: null, // No traditional RPC for balance fetching
        explorerUrl: 'https://mempool.space',
        currencySymbol: 'BTC',
        etherscanApiUrl: 'https://mempool.space/api', // For UTXOs, fees, etc.
        bitcoinjslib_network: bitcoin.networks.bitcoin,
    },
    bitcoin_testnet: {
        id: 'bitcoin_testnet',
        name: 'Bitcoin (Testnet)',
        chainType: 'bitcoin',
        rpcUrl: null,
        explorerUrl: 'https://mempool.space/testnet',
        currencySymbol: 'tBTC',
        etherscanApiUrl: 'https://mempool.space/testnet/api',
        bitcoinjslib_network: bitcoin.networks.testnet,
    }
};

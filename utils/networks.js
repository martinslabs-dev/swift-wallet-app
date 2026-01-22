
export const NETWORKS = {
    mainnet: {
        id: 'mainnet',
        name: 'Ethereum Mainnet',
        rpcUrl: `https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID`, // Replace with your Infura ID
        explorerUrl: 'https://etherscan.io',
        currencySymbol: 'ETH',
        etherscanApiUrl: 'https://api.etherscan.io/api',
    },
    sepolia: {
        id: 'sepolia',
        name: 'Sepolia Testnet',
        rpcUrl: 'https://rpc.sepolia.org',
        explorerUrl: 'https://sepolia.etherscan.io',
        currencySymbol: 'SepoliaETH',
        etherscanApiUrl: 'https://api-sepolia.etherscan.io/api',
    },
    // Add other networks like Polygon, Arbitrum etc. here
};

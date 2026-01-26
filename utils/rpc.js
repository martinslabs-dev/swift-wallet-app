
// A simple, privacy-preserving RPC URL rotator.
// It cycles through a list of public RPC endpoints to distribute the load.

const RPC_URLS = {
    // Ethereum Mainnet
    1: [
        `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
        'https://rpc.ankr.com/eth',
        'https://cloudflare-eth.com', // Added Cloudflare as another robust alternative
        'https://eth.public-node.com',
    ],
    // Sepolia Testnet
    11155111: [
        `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
        'https://rpc.ankr.com/eth_sepolia',
    ],
    // BNB Smart Chain
    56: [
        'https://bsc-dataseed1.binance.org/',
        'https://bsc-dataseed2.binance.org/',
        'https://rpc.ankr.com/bsc',
    ],
    // Solana Mainnet
    'solana-mainnet': [
        'https://api.mainnet-beta.solana.com',
        'https://rpc.ankr.com/solana',
    ],
    // Bitcoin - No standard JSON-RPC, so this is a placeholder
    'bitcoin-mainnet': [], 
};

let callCount = 0;

/**
 * Gets a viable RPC URL for a given chainId in a round-robin fashion.
 * @param {number | string} chainId - The chain ID or a string identifier for the network.
 * @returns {string | null} - A randomly selected RPC URL or null if no URLs are available.
 */
export const getRpcUrl = (chainId) => {
    const urls = RPC_URLS[chainId];
    if (!urls || urls.length === 0) {
        console.error(`No RPC URLs configured for chainId: ${chainId}`);
        return null;
    }

    // Cycle through the URLs based on the number of calls
    const index = callCount % urls.length;
    callCount++; // Increment for the next call

    return urls[index];
};

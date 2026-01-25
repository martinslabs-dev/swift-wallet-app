
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const dapps = [
    {
        name: 'Uniswap',
        description: 'Swap, earn, and build on the leading decentralized crypto trading protocol.',
        url: 'https://app.uniswap.org/',
        icon: 'https://app.uniswap.org/favicon.ico',
    },
    {
        name: 'OpenSea',
        description: 'The world’s first and largest digital marketplace for crypto collectibles and NFTs.',
        url: 'https://opensea.io/',
        icon: 'https://opensea.io/favicon.ico',
    },
    {
        name: 'Aave',
        description: 'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
        url: 'https://app.aave.com/',
        icon: 'https://app.aave.com/favicon.ico',
    },
    {
        name: 'Etherscan',
        description: 'The leading block explorer and analytics platform for Ethereum, the decentralized smart contracts platform.',
        url: 'https://etherscan.io/',
        icon: 'https://etherscan.io/favicon.ico',
    },

];

const DappsPage = () => {
    const router = useRouter();

    const navigateToDapp = (url) => {
        router.push(`/dapp-browser?url=${encodeURIComponent(url)}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Dapp Store</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dapps.map((dapp, index) => (
                    <motion.div
                        key={index}
                        className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center cursor-pointer"
                        whileHover={{ scale: 1.05, y: -5 }}
                        onClick={() => navigateToDapp(dapp.url)}
                    >
                        <img src={dapp.icon} alt={`${dapp.name} icon`} className="w-16 h-16 rounded-full mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">{dapp.name}</h2>
                        <p className="text-gray-400 flex-grow">{dapp.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DappsPage;

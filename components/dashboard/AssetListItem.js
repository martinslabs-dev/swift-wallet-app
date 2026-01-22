import { motion } from 'framer-motion';
import Image from 'next/image';

const AssetListItem = ({ asset }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center justify-between shadow-lg"
  >
    <div className="flex items-center space-x-4">
      <Image
        src={asset.icon}
        alt={asset.name}
        width={40}
        height={40}
        className="rounded-full"
      />
      <div>
        <p className="text-white font-semibold">{asset.name}</p>
        <p className="text-gray-400 text-sm">${asset.marketCap}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-white font-semibold">${asset.price}</p>
      <p
        className={asset.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}
      >
        {asset.change}
      </p>
    </div>
  </motion.div>
);

export default AssetListItem;

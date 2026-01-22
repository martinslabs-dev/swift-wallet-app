
import { FiSettings, FiSearch, FiChevronDown } from 'react-icons/fi';
import { LiaQrcodeSolid } from 'react-icons/lia';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';

const WalletHeader = () => (
  <div className="flex items-center justify-between mb-8 px-2">
    <div className="flex items-center space-x-5">
      <button className="text-gray-400 hover:text-white transition-colors duration-200">
        <FiSettings size={22} />
      </button>
      <button className="text-gray-400 hover:text-white transition-colors duration-200">
        <LiaQrcodeSolid size={26} />
      </button>
    </div>

    <div className="flex items-center space-x-2">
        <div className="relative">
            <h1 className="text-xl font-semibold text-white">Main Wallet 1</h1>
            <div className="absolute top-0 right-[-10px] w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <FiChevronDown className="text-gray-400" size={20} />
    </div>

    <div className="flex items-center space-x-5">
      <button className="text-gray-400 hover:text-white transition-colors duration-200">
        <HiOutlineClipboardDocument size={24} />
      </button>
      <button className="text-gray-400 hover:text-white transition-colors duration-200">
        <FiSearch size={22} />
      </button>
    </div>
  </div>
);

export default WalletHeader;

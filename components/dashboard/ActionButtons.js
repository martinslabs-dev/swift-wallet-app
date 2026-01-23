
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiZap } from 'react-icons/fi';

const ActionButton = ({ icon, label, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center space-y-2 cursor-pointer"
        onClick={onClick}
    >
        <div className="flex items-center justify-center w-16 h-16 bg-gray-800/60 backdrop-blur-sm rounded-full shadow-lg border border-gray-700/50">
            <div className="text-white text-2xl">{icon}</div>
        </div>
        <p className="text-sm text-gray-300 font-semibold">{label}</p>
    </motion.div>
);


const ActionButtons = ({ onSend, onReceive, onSwap }) => {
  return (
    <div className="flex justify-center items-center space-x-6 my-6">
      <ActionButton icon={<FiArrowUp />} label="Send" onClick={onSend} />
      <ActionButton icon={<FiArrowDown />} label="Receive" onClick={onReceive} />
      <ActionButton icon={<FiZap />} label="Swap" onClick={onSwap} />
    </div>
  );
};

export default ActionButtons;

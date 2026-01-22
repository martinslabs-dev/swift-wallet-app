import { motion } from 'framer-motion';
import { FiPlus, FiSend, FiDollarSign, FiZap } from 'react-icons/fi';

const ActionButtons = () => {
  const buttons = [
    { icon: <FiSend />, label: 'Send' },
    { icon: <FiPlus />, label: 'Fund' },
    { icon: <FiDollarSign />, label: 'Sell' },
    { icon: <FiZap />, label: 'Swap' },
  ];

  return (
    <div className="flex justify-center items-center space-x-6 my-8">
      {buttons.map((button, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center space-y-2 cursor-pointer"
        >
          <div className="bg-gray-800 rounded-full p-4 shadow-lg">
            <div className="text-white text-2xl">{button.icon}</div>
          </div>
          <p className="text-sm text-gray-400 font-semibold">{button.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default ActionButtons;

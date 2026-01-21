import React from 'react';
import { motion } from 'framer-motion';
import { BsBackspace } from 'react-icons/bs'; // Using a popular icon library

const NumberKeyboard = ({ onKeyPress, onBackspace, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

  const handleKeyClick = (key) => {
    if (key === 'backspace') {
      onBackspace();
    } else if (key !== '') {
      onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-xs mx-auto">
      {keys.map((key) => (
        <motion.button
          key={key}
          onClick={() => handleKeyClick(key)}
          className={`h-20 rounded-full text-3xl font-light flex items-center justify-center ${key === '' ? 'pointer-events-none' : 'bg-gray-800/50'}`}
          whileTap={{ scale: 0.9, backgroundColor: 'rgba(100, 116, 139, 0.5)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          disabled={key === ''}
        >
          {key === 'backspace' ? <BsBackspace /> : key}
        </motion.button>
      ))}
    </div>
  );
};

export default NumberKeyboard;

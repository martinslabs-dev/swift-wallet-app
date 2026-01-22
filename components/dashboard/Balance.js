import { motion } from 'framer-motion';

const Balance = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center my-8"
  >
    <p className="text-gray-400 text-lg">Your Balance</p>
    <h1 className="text-5xl font-bold text-white">$69,420.00</h1>
  </motion.div>
);

export default Balance;

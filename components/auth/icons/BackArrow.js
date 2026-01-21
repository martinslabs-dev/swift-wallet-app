
import { motion } from 'framer-motion';

const BackArrow = ({...props}) => (
    <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        {...props}
        className="w-8 h-8"
    >
        <defs>
            <linearGradient id="back-arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00FFA3" />
                <stop offset="100%" stopColor="#00D1FF" />
            </linearGradient>
        </defs>
        <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
            stroke="url(#back-arrow-gradient)"
        />
    </motion.svg>
);

export default BackArrow;

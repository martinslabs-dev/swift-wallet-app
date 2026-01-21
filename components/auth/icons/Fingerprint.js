
import { motion } from 'framer-motion';

const Fingerprint = ({ ...props }) => (
    <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        fill="none"
        {...props}
        className="w-32 h-32"
    >
        <defs>
            <radialGradient id="fingerprint-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#00D1FF" />
                <stop offset="100%" stopColor="#00FFA3" />
            </radialGradient>
        </defs>
        <motion.path
            d="M12 3.5c-4.694 0-8.5 3.806-8.5 8.5s3.806 8.5 8.5 8.5 8.5-3.806 8.5-8.5-3.806-8.5-8.5-8.5z"
            stroke="url(#fingerprint-gradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }}
        />
        <motion.path
            d="M12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5z"
            stroke="url(#fingerprint-gradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, transition: { duration: 1.5, delay: 0.2, ease: "easeInOut" } }}
        />
        <motion.path
            d="M9.5 14.5c.344.344.75.625 1.188.813M14.5 9.5c-.344-.344-.75-.625-1.188-.813"
            stroke="url(#fingerprint-gradient)"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, transition: { duration: 1, delay: 0.5, ease: "easeInOut" } }}
        />
    </motion.svg>
);

export default Fingerprint;

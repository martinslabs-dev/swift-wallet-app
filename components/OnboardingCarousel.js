
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";

const slideContent = [
    {
        title: "Secure Wallet",
        description: "Your keys are encrypted and stored locally. Only you control your crypto.",
        icon: (
            <motion.svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12.99H5V6.3l7-3.11v9.8z"
                    fill="url(#glow-gradient)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }}
                />
                <defs>
                    <radialGradient id="glow-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#00FFA3" />
                        <stop offset="100%" stopColor="#00D1FF" />
                    </radialGradient>
                </defs>
            </motion.svg>
        )
    },
    {
        title: "Atomic Swaps",
        description: "Swap assets instantly without intermediaries. Trustless and on-chain.",
        icon: (
             <motion.svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: { duration: 1, type: "spring", stiffness: 100 } }}
            >
                <motion.path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00D1FF" />
                <motion.path d="M17 9l4-4-4 4zM17 9l-4 4 4-4z" stroke="#00FFA3"
                    animate={{
                        d: ["M17 9l4-4-4 4z", "M7 15l-4 4 4-4z", "M17 9l4-4-4 4z"],
                        transition: { repeat: Infinity, duration: 2, ease: "linear" }
                    }}
                />
            </motion.svg>
        )
    },
    {
        title: "Cross-Chain Bridge",
        description: "Move assets seamlessly across multiple blockchains in one tap.",
        icon: (
            <motion.svg className="w-24 h-24" viewBox="0 0 24 24" fill="none">
                <motion.rect x="3" y="8" width="18" height="8" rx="1" stroke="url(#bridge-gradient)" strokeWidth="2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 8, opacity: 1, transition: { duration: 1 } }}
                />
                <motion.path d="M8 8V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v3" stroke="#00FFA3" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, transition: { duration: 1, delay: 0.5 } }}
                />
                 <defs>
                    <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00D1FF" />
                        <stop offset="100%" stopColor="#00FFA3" />
                    </linearGradient>
                </defs>
            </motion.svg>
        )
    },
    {
        title: "Lower Gas Fees",
        description: "Smart routing finds the cheapest path for every transaction.",
        icon: (
            <motion.svg className="w-24 h-24" viewBox="0 0 24 24" fill="none">
                <motion.path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm-1 13H9V8h2v8zm4 0h-2V8h2v8z" fill="#00FFA3"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                        scale: 1, opacity: 1,
                        transition: { duration: 0.8 }
                    }}
                />
                <motion.path d="M9 13h6" stroke="#1A1B1E" strokeWidth="2"
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1, transition: { duration: 1, delay: 0.8 } }}
                />
            </motion.svg>
        )
    },
    {
        title: "Earn Rewards",
        description: "Stake your crypto and earn passive income directly from your wallet.",
        icon: (
            <motion.svg className="w-24 h-24" viewBox="0 0 24 24" fill="none">
                 <motion.path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 6h14" stroke="url(#rewards-gradient)" strokeWidth="2" />
                 <motion.circle cx="12" cy="12" r="3" fill="#00D1FF"
                    initial={{ scale:0, opacity:0 }}
                    animate={{ scale:1, opacity:1, transition: { delay: 0.5, duration: 1} }}
                 />
                 <defs>
                    <linearGradient id="rewards-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00FFA3" />
                        <stop offset="100%" stopColor="#00D1FF" />
                    </linearGradient>
                </defs>
            </motion.svg>
        )
    },
];

const variants = {
    enter: (direction) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        };
    }
};

const OnboardingCarousel = ({ onCreateWallet }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const slideIndex = wrap(0, slideContent.length, page);

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    useEffect(() => {
        const timer = setTimeout(() => paginate(1), 5000);
        return () => clearTimeout(timer);
    }, [page]);


    return (
        <div className="flex flex-col h-screen justify-between p-6 overflow-hidden">
            {/* Carousel */}
            <div className="relative flex items-center justify-center flex-1">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x);
                            if (swipe > 50) {
                                paginate(offset.x > 0 ? -1 : 1);
                            }
                        }}
                        className="absolute w-full h-full flex flex-col items-center justify-center text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                            className="w-48 h-48 mb-8 flex items-center justify-center"
                        >
                            {slideContent[slideIndex].icon}
                        </motion.div>
                        <div className="max-w-xs">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }}
                                className="text-3xl font-bold text-white mb-2"
                            >
                                {slideContent[slideIndex].title}
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.6, duration: 0.5 } }}
                                className="text-gray-400"
                            >
                                {slideContent[slideIndex].description}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center space-x-2 my-4">
                {slideContent.map((_, i) => (
                    <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${slideIndex === i ? "bg-white" : "bg-gray-600"}`}
                        onClick={() => setPage([i, i > slideIndex ? 1 : -1])}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="w-full">
                 <motion.button 
                    onClick={onCreateWallet}
                    className="w-full bg-energy-gradient text-black py-4 rounded-xl font-bold text-xl tracking-wider mb-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Create new wallet
                </motion.button>
                <motion.button 
                    className="w-full bg-gray-700 text-white py-4 rounded-xl font-bold text-lg"
                    whileHover={{ scale: 1.05, backgroundColor: "#4A5568" }}
                    whileTap={{ scale: 0.95 }}
                >
                    I already have a wallet
                </motion.button>
                <p className="text-gray-500 text-xs text-center mt-4">
                    By tapping any button you agree to our <br />
                    <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default OnboardingCarousel;

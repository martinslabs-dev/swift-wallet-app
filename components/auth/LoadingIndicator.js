
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingIndicator = ({ show }) => {
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const containerVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { 
            scale: 1, 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1, 
                type: 'spring', 
                damping: 15, 
                stiffness: 100 
            }
        }
    };

    const orbVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    };

    const particleVariants = {
        hidden: { x: 0, y: 0, opacity: 0 },
        visible: (i) => ({
            opacity: [0, 1, 0],
            x: Math.cos(i * (Math.PI / 4)) * 80,
            y: Math.sin(i * (Math.PI / 4)) * 80,
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.25,
                ease: "linear"
            }
        })
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.div 
                        className="relative w-48 h-48"
                        variants={containerVariants}
                    >
                        <motion.div 
                            className="absolute inset-10 bg-energy-gradient rounded-full shadow-2xl shadow-electric-cyan/50"
                            variants={orbVariants}
                            transition={{ type: 'spring' }}
                        />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute top-1/2 left-1/2 w-3 h-3 bg-electric-cyan rounded-full"
                                custom={i}
                                variants={particleVariants}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingIndicator;

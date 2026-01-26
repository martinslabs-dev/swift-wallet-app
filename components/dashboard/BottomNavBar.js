
import { motion } from 'framer-motion';
import WalletIcon from './icons/WalletIcon';
import BridgeIcon from './icons/BridgeIcon';
import GlobeIcon from './icons/GlobeIcon';
import UsersIcon from './icons/UsersIcon';
import CogIcon from './icons/CogIcon';

const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
    // Active text will have a gradient color
    const activeTextClass = 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold';
    // Active icon will be solid cyan
    const activeIconClass = 'text-cyan-400';
    // Inactive elements will be gray
    const inactiveClass = 'text-gray-400';

    return (
        <motion.button
            onClick={onClick}
            className="flex flex-col items-center justify-center w-full h-full relative focus:outline-none"
            whileTap={{ scale: 0.9 }}
        >
            <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? activeIconClass : inactiveClass}`} />
            <span className={`text-xs mt-1 transition-colors duration-300 ${isActive ? activeTextClass : inactiveClass}`}>
                {label}
            </span>
            {isActive && (
                <motion.div
                    // The active indicator will be a gradient bar at the top, matching the text
                    className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
                    layoutId="active-indicator" // This creates the sliding animation
                />
            )}
        </motion.button>
    );
};


const BottomNavBar = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'wallet', label: 'Wallet', icon: WalletIcon },
        { id: 'bridge', label: 'Bridge', icon: BridgeIcon },
        { id: 'dapps', label: 'dApps', icon: GlobeIcon },
        { id: 'accounts', label: 'Accounts', icon: UsersIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
    ];

    return (
        <motion.div 
            className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-md z-50"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
            <div className="w-full h-full max-w-md mx-auto flex justify-around items-center">
                {navItems.map(item => (
                    <NavItem 
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeTab === item.id}
                        onClick={() => onTabChange(item.id)}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default BottomNavBar;

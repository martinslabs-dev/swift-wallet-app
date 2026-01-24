
import { motion } from 'framer-motion';
import NewSendIcon from './icons/NewSendIcon';
import NewReceiveIcon from './icons/NewReceiveIcon';
import NewSwapIcon from './icons/NewSwapIcon';
import ActionButton from '../ui/ActionButton';

const ActionButtons = ({ onSend, onReceive, onSwap, isViewOnly }) => {
    return (
        <div className="glass-card py-4 px-6">
            <div className="flex justify-around items-center space-x-4">
                <ActionButton icon={NewSendIcon} label="Send" onClick={onSend} disabled={isViewOnly} />
                <ActionButton icon={NewReceiveIcon} label="Receive" onClick={onReceive} />
                <ActionButton icon={NewSwapIcon} label="Swap" onClick={onSwap} disabled={isViewOnly} />
            </div>
        </div>
    );
};

export default ActionButtons;

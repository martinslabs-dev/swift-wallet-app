
import { useModal } from '../../context/ModalContext';
import TransactionModal from './TransactionModal';
import SigningModal from './SigningModal';
import { AnimatePresence } from 'framer-motion';

const MODAL_COMPONENTS = {
    transaction: TransactionModal,
    sign_message: SigningModal,
    // Add other modals here as they are created
};

const ModalRenderer = () => {
    const { modal, isModalOpen } = useModal();

    const SpecificModal = modal ? MODAL_COMPONENTS[modal.type] : null;

    return (
        <AnimatePresence>
            {isModalOpen && SpecificModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <SpecificModal data={modal.data} />
                </div>
            )}
        </AnimatePresence>
    );
};

export default ModalRenderer;

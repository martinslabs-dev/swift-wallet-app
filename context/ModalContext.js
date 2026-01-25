
import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState(null); // e.g., { type: 'transaction', data: {...} }
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = useCallback((type, data) => {
        setModal({ type, data });
        setIsModalOpen(true);
    }, []);

    const hideModal = useCallback(() => {
        setIsModalOpen(false);
        // We delay clearing the modal data to allow for a closing animation
        setTimeout(() => setModal(null), 300);
    }, []);

    // This will hold the callbacks for the user's decision (approve/reject)
    const [decisionCallbacks, setDecisionCallbacks] = useState(null);

    // A new function to request a decision from the user
    const requestDecision = useCallback((type, data) => {
        return new Promise((resolve, reject) => {
            setDecisionCallbacks({ resolve, reject });
            showModal(type, data);
        });
    }, [showModal]);

    const value = {
        modal,
        isModalOpen,
        showModal,
        hideModal,
        requestDecision,
        decisionCallbacks,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

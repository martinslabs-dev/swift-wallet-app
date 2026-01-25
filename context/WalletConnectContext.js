
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import WalletConnectService from '../utils/walletConnect';
import SessionProposalModal from '../components/walletconnect/SessionProposalModal';
import SessionRequestModal from '../components/walletconnect/SessionRequestModal';

const WalletConnectContext = createContext(null);

export const WalletConnectProvider = ({ children }) => {
    const [service, setService] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [proposal, setProposal] = useState(null);
    const [request, setRequest] = useState(null);
    const [session, setSession] = useState(null);

    const onSessionProposal = useCallback((proposal) => {
        console.log("Caught session_proposal in context:", proposal);
        setProposal(proposal);
    }, []);

    const onSessionRequest = useCallback((request) => {
        console.log("Caught session_request in context:", request);
        const activeSessions = WalletConnectService.getActiveSessions();
        const session = activeSessions[request.topic];
        setRequest(request);
        setSession(session);
    }, []);

    useEffect(() => {
        const init = async () => {
            await WalletConnectService.initialize();
            setService(WalletConnectService);
            setIsInitialized(true);

            WalletConnectService.web3wallet.on('session_proposal', onSessionProposal);
            WalletConnectService.web3wallet.on('session_request', onSessionRequest);
        };

        if (!WalletConnectService.initialized) {
            init();
        }

        return () => {
            if (WalletConnectService.web3wallet) {
                WalletConnectService.web3wallet.off('session_proposal', onSessionProposal);
                WalletConnectService.web3wallet.off('session_request', onSessionRequest);
            }
        };
    }, [onSessionProposal, onSessionRequest]);

    const handleApproveProposal = async (proposal, accounts) => {
        if (service) {
            try {
                await service.approveSession(proposal, accounts);
            } catch (error) {
                console.error("Failed to approve session:", error);
            }
        }
        setProposal(null);
    };

    const handleRejectProposal = async (proposal) => {
        if (service) {
            try {
                await service.rejectSession(proposal);
            } catch (error) {
                console.error("Failed to reject session:", error);
            }
        }
        setProposal(null);
    };
    
    const handleApproveRequest = async (response) => {
        if(service) {
            try {
                await service.respondSessionRequest({ topic: response.topic, response: {id: response.id, result: response.result, jsonrpc: '2.0'} });
            } catch (error) {
                console.error("Failed to approve request:", error);
            }
        }
        setRequest(null);
        setSession(null);
    }

    const handleRejectRequest = async (response) => {
        if(service) {
            try {
                await service.respondSessionRequest({ topic: response.topic, response: {id: response.id, error: response.error, jsonrpc: '2.0'} });
            } catch (error) {
                console.error("Failed to reject request:", error);
            }
        }
        setRequest(null);
        setSession(null);
    }


    const value = {
        service,
        isInitialized,
        proposal,
        request,
        session,
    };

    return (
        <WalletConnectContext.Provider value={value}>
            {children}
            {proposal && (
                <SessionProposalModal 
                    proposal={proposal} 
                    onApprove={handleApproveProposal} 
                    onReject={handleRejectProposal} 
                />
            )}
            {request && session && (
                <SessionRequestModal 
                    session={session}
                    request={request} 
                    onApprove={handleApproveRequest} 
                    onReject={handleRejectRequest} 
                />
            )}
        </WalletConnectContext.Provider>
    );
};

export const useWalletConnect = () => {
    const context = useContext(WalletConnectContext);
    if (!context) {
        throw new Error('useWalletConnect must be used within a WalletConnectProvider');
    }
    return context;
};

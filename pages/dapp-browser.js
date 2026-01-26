
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiArrowRight, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import ConnectionManager from '../components/dapps/ConnectionManager';
import { DappConnectionProvider, useDappConnection } from '../context/DappConnectionContext';
import { useWallet } from '../context/WalletContext';
import { useModal } from '../context/ModalContext';
import { signTransaction, signPersonalMessage, signTypedData } from '../utils/wallet';

const DappBrowser = () => {
    const router = useRouter();
    const { url } = router.query;
    const [iframeUrl, setIframeUrl] = useState('');
    const iframeRef = useRef(null);
    
    const { accounts, getPrivateKeyForAddress } = useWallet();
    const { connect, getConnection } = useDappConnection();
    const { requestDecision } = useModal();

    useEffect(() => {
        if (url && decodeURIComponent(url) !== iframeUrl) {
            setIframeUrl(decodeURIComponent(url));
        }
    }, [url]);

    const postResponse = useCallback((id, data) => {
        iframeRef.current?.contentWindow.postMessage(
            { type: 'provider_response', id, data },
            new URL(iframeUrl).origin
        );
    }, [iframeUrl]);

    const handleProviderRequest = useCallback(async (id, { method, params }) => {
        const origin = new URL(iframeUrl).origin;
        const connection = getConnection(origin);

        try {
            switch (method) {
                case 'eth_requestAccounts':
                case 'eth_accounts': {
                    if (connection && connection.accounts.length > 0) {
                        return postResponse(id, { result: connection.accounts });
                    }
                    if (accounts && accounts.length > 0) {
                        const userAddress = accounts[0].address;
                        // In a real app, you would show a connection modal.
                        // Here, we auto-connect for simplicity.
                        connect(origin, [userAddress]);
                        return postResponse(id, { result: [userAddress] });
                    }
                    return postResponse(id, { result: [] });
                }

                case 'eth_sendTransaction': {
                    const transaction = params[0];
                    const { approved } = await requestDecision('transaction', { transaction });
                    if (approved) {
                        const privateKey = getPrivateKeyForAddress(transaction.from);
                        if (!privateKey) throw new Error('Private key not found for sender address.');
                        const txHash = await signTransaction(transaction, privateKey);
                        return postResponse(id, { result: txHash });
                    }
                    break; // Rejection is handled in the catch block
                }

                case 'personal_sign': {
                    const [message, address] = params;
                    const { approved } = await requestDecision('sign_message', { message, method });
                     if (approved) {
                        const privateKey = getPrivateKeyForAddress(address);
                        if (!privateKey) throw new Error('Private key not found for signing address.');
                        const signature = await signPersonalMessage(message, privateKey);
                        return postResponse(id, { result: signature });
                    }
                    break;
                }
                
                case 'eth_signTypedData_v4': {
                    const [address, typedData] = params;
                    // The dapp sends a stringified JSON object
                    const parsedData = JSON.parse(typedData);
                    const { approved } = await requestDecision('sign_message', { 
                        message: JSON.stringify(parsedData, null, 2), 
                        method 
                    });
                    if (approved) {
                        const privateKey = getPrivateKeyForAddress(address);
                        if (!privateKey) throw new Error('Private key not found for signing address.');
                        const signature = await signTypedData(parsedData, privateKey);
                        return postResponse(id, { result: signature });
                    }
                    break;
                }

                default: {
                    throw new Error(`Unsupported RPC method: ${method}`);
                }
            }
        } catch (error) {
            console.error(`Failed to handle RPC request (${method}):`, error);
            postResponse(id, { error: { code: -32603, message: error.message } });
        }
    }, [iframeUrl, accounts, connect, getConnection, getPrivateKeyForAddress, requestDecision, postResponse]);

    // ... (rest of the component remains the same)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.source !== iframeRef.current?.contentWindow || !event.data.type) return;
            if (event.data.type === 'provider_request') {
                handleProviderRequest(event.data.id, event.data.data);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleProviderRequest]);

    const handleIframeLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        fetch('/inpage-provider.js')
            .then(response => response.text())
            .then(scriptContent => {
                const script = iframe.contentDocument.createElement('script');
                script.textContent = scriptContent;
                iframe.contentDocument.head.appendChild(script);
            })
            .catch(error => console.error('Failed to inject provider:', error));
    }, []);

    const handleNavigation = (newUrl) => {
        if (newUrl.startsWith('http')) {
            setIframeUrl(newUrl);
            router.push(`/dapp-browser?url=${encodeURIComponent(newUrl)}`, undefined, { shallow: true });
        }
    }; 
    const goBack = () => iframeRef.current?.contentWindow.history.back();
    const goForward = () => iframeRef.current?.contentWindow.history.forward();
    const refresh = () => iframeRef.current?.contentWindow.location.reload();
    const openExternal = () => window.open(iframeUrl, '_blank');

    return (
        <div className="flex flex-col h-screen text-white">
            <div className="bg-gray-800 p-2 flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2">
                    <button onClick={goBack}><FiArrowLeft /></button>
                    <button onClick={goForward}><FiArrowRight /></button>
                    <button onClick={refresh}><FiRefreshCw /></button>
                </div>
                <input type="text" value={iframeUrl} onChange={(e) => setIframeUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNavigation(e.target.value)} className="flex-grow bg-gray-900 px-4 py-2 rounded-full text-sm" placeholder="https://..." />
                <div className="flex items-center space-x-2">
                    {iframeUrl && <ConnectionManager dappUrl={iframeUrl} />}
                    <button onClick={openExternal}><FiExternalLink /></button>
                </div>
            </div>
            <div className="flex-grow relative bg-gray-900">
                {iframeUrl ? <iframe ref={iframeRef} src={iframeUrl} onLoad={handleIframeLoad} className="w-full h-full border-none absolute" title="Dapp Browser" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" /> : <div className="flex items-center justify-center h-full"><p className="text-gray-500">Enter a URL to start browsing.</p></div>}
            </div>
        </div>
    );
};

const DappBrowserPage = () => (
    <DappConnectionProvider>
        <DappBrowser />
    </DappConnectionProvider>
);

export default DappBrowserPage;

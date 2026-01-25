
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from '../../styles/modules/DappBrowser.module.css';
import { useNetwork } from '../../context/NetworkContext'; // Import the useNetwork hook

const DappBrowser = () => {
    const [url, setUrl] = useState('');
    const [displayUrl, setDisplayUrl] = useState('');
    const iframeRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectionRequest, setConnectionRequest] = useState(null);
    const { activeNetwork } = useNetwork(); // Use the network context

    // Get the wallet address from the active network
    const walletAddress = activeNetwork?.accounts?.[0];

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.source !== iframeRef.current?.contentWindow) {
                return;
            }

            const { type, method, requestId } = event.data;

            if (type === 'FROM_PAGE' && method === 'eth_requestAccounts') {
                console.log('Connection request received from dapp:', event.origin);
                setConnectionRequest({
                    origin: event.origin,
                    requestId,
                });
                setIsModalOpen(true);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleApprove = () => {
        if (!connectionRequest || !walletAddress) return;

        iframeRef.current.contentWindow.postMessage({
            type: 'TO_PAGE',
            requestId: connectionRequest.requestId,
            result: [walletAddress],
        }, connectionRequest.origin);

        setIsModalOpen(false);
        setConnectionRequest(null);
    };

    const handleDeny = () => {
        if (!connectionRequest) return;

        iframeRef.current.contentWindow.postMessage({
            type: 'TO_PAGE',
            requestId: connectionRequest.requestId,
            error: { code: 4001, message: 'User rejected the request.' },
        }, connectionRequest.origin);

        setIsModalOpen(false);
        setConnectionRequest(null);
    };

    const handleGo = () => {
        if (url) {
            let finalUrl = url;
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }
            setDisplayUrl(finalUrl);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleGo();
        }
    };

    const handleIframeLoad = async () => {
        try {
            const iframeUrl = iframeRef.current.contentWindow.location.href;
            setUrl(iframeUrl);
            // Don't set displayUrl here to avoid loops

            // Inject the provider script
            const response = await fetch('/injected.js');
            const script = await response.text();
            
            // This is the ideal way to inject, but may be blocked by cross-origin policy
            const scriptEl = iframeRef.current.contentDocument.createElement('script');
            scriptEl.textContent = script;
            iframeRef.current.contentDocument.head.appendChild(scriptEl);
            console.log("Successfully injected provider script.");

        } catch (error) {
            console.error("Could not inject script into iframe:", error);
            // This error is expected on cross-origin iframes. The communication
            // channel will still work if the dapp is manually configured.
        }
    };
    
    const canGoBack = () => iframeRef.current && iframeRef.current.contentWindow.history.length > 1;
    const canGoForward = () => false; // More complex to track reliably

    return (
        <div className={styles.browserContainer}>
            <AnimatePresence>
                {isModalOpen && connectionRequest && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gray-800 rounded-2xl w-full max-w-sm shadow-lg p-6 text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-2">Connection Request</h2>
                            <p className="text-gray-400 mb-4 break-words">The site <strong className="text-white">{connectionRequest.origin}</strong> wants to connect to your wallet.</p>
                            <p className="text-gray-400 mb-6">This will allow the site to view your public address.</p>
                            <div className="flex flex-col gap-4">
                                <motion.button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg"
                                    onClick={handleApprove}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!walletAddress} // Disable if no wallet address
                                >
                                    {walletAddress ? 'Approve' : 'No Wallet Found'}
                                </motion.button>
                                <motion.button
                                    className="w-full bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white py-3 rounded-xl font-bold text-lg"
                                    onClick={handleDeny}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Deny
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.addressBar}>
                <div className={styles.navButtons}>
                    <button onClick={() => iframeRef.current?.contentWindow.history.back()} disabled={!canGoBack()}>←</button>
                    <button onClick={() => iframeRef.current?.contentWindow.history.forward()} disabled={!canGoForward()}>→</button>
                    <button onClick={() => iframeRef.current?.contentWindow.location.reload()}>⟳</button>
                </div>
                <input
                    type="text"
                    className={styles.urlInput}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search or enter a URL"
                />
                <button className={styles.menuButton} onClick={handleGo}>Go</button>
            </div>

            <div className={styles.iframeContainer}>
                {displayUrl ? (
                    <iframe
                        ref={iframeRef}
                        src={displayUrl}
                        className={styles.iframe}
                        onLoad={handleIframeLoad}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <h1>Dapp Browser</h1>
                        <p>Enter a URL to start browsing decentralized applications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DappBrowser;

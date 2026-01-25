
// This script is injected into the dapp's context

(function() {
    if (window.ethereum) {
        console.log('Injected script: window.ethereum already exists.');
        return;
    }

    console.log('Injecting custom Ethereum provider.');

    const provider = {
        isMetaMask: true, // Emulate MetaMask
        isOurWallet: true, // Custom flag
        _isConnected: false,
        _accounts: [],

        request: async ({ method, params }) => {
            console.log(`[Injected Provider] Request: ${method}`, params);

            return new Promise((resolve, reject) => {
                const requestId = Date.now() + Math.random();

                const message = {
                    type: 'FROM_PAGE',
                    requestId,
                    method,
                    params,
                };

                // Post message to the parent window (the wallet UI)
                window.parent.postMessage(message, '*');

                const handleResponse = (event) => {
                    if (event.data.type === 'TO_PAGE' && event.data.requestId === requestId) {
                        window.removeEventListener('message', handleResponse);

                        if (event.data.error) {
                            reject(new Error(event.data.error));
                        } else {
                            if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
                                provider._accounts = event.data.result;
                                provider._isConnected = provider._accounts.length > 0;
                                provider.emit('accountsChanged', provider._accounts);
                            }
                            resolve(event.data.result);
                        }
                    }
                };

                window.addEventListener('message', handleResponse);
            });
        },

        send: (payload, callback) => {
            provider.request(payload)
                .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
                .catch(error => callback(error));
        },

        sendAsync: (payload, callback) => {
            provider.send(payload, callback);
        },

        isConnected: () => {
            return provider._isConnected;
        },

        // Event Emitter part
        _events: {},
        on: (eventName, listener) => {
            if (!provider._events[eventName]) {
                provider._events[eventName] = [];
            }
            provider._events[eventName].push(listener);
        },
        removeListener: (eventName, listener) => {
            if (provider._events[eventName]) {
                const index = provider._events[eventName].indexOf(listener);
                if (index > -1) {
                    provider._events[eventName].splice(index, 1);
                }
            }
        },
        emit: (eventName, ...args) => {
            if (provider._events[eventName]) {
                provider._events[eventName].forEach(listener => listener(...args));
            }
        }
    };

    window.ethereum = provider;

    // Dispatch a custom event to let dapps know the provider is ready
    window.dispatchEvent(new Event('ethereum#initialized'));
})();

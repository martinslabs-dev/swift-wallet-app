
// In-page provider for dapps running in the iframe
// This script is injected into the dapp's context.

class InpageProvider {
    constructor() {
        this.isMetaMask = true; // Claim to be MetaMask for compatibility
        this.isReady = true;
        this.requests = {}; // Store pending requests
        this.requestCount = 0;

        // Listen for messages from the parent wallet window
        window.addEventListener('message', (event) => {
            // IMPORTANT: Check the origin for security
            // In a real app, you would have a more robust origin check
            if (event.source !== window.parent) {
                return;
            }
            
            const { type, id, data } = event.data;

            if (type === 'provider_response') {
                const request = this.requests[id];
                if (request) {
                    if (data.error) {
                        request.reject(new Error(data.error.message));
                    } else {
                        request.resolve(data.result);
                    }
                    delete this.requests[id];
                }
            }
        });
    }

    // EIP-1193 request method
    async request({ method, params }) {
        this.requestCount++;
        const id = this.requestCount;

        return new Promise((resolve, reject) => {
            // Store the promise handlers
            this.requests[id] = { resolve, reject };

            // Send the request to the parent window (the wallet)
            window.parent.postMessage(
                {
                    type: 'provider_request',
                    id,
                    data: { method, params },
                },
                '*' // In a real app, specify the wallet's origin
            );

            // Optional: Add a timeout for requests
            setTimeout(() => {
                if (this.requests[id]) {
                    this.requests[id].reject(new Error('Request timed out'));
                    delete this.requests[id];
                }
            }, 300000); // 5 minutes timeout
        });
    }
    
    // Legacy methods for compatibility
    send(payload, callback) {
        this.request(payload)
            .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
            .catch(error => callback(error));
    }

    sendAsync(payload, callback) {
        this.request(payload)
            .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
            .catch(error => callback(error));
    }

    isConnected() {
        return true; // This should be updated based on actual connection status
    }

    on(event, listener) {
        // Basic event emitter (can be expanded)
        // For now, we only handle 'accountsChanged'
        window.addEventListener('message', (event) => {
            if (event.source === window.parent && event.data.type === `provider_event_${event}`) {
                listener(event.data.data);
            }
        });
    }
}

// Inject the provider into the window
if (typeof window.ethereum === 'undefined') {
    window.ethereum = new InpageProvider();
    console.log('Injected window.ethereum provider.');
} else {
    console.log('window.ethereum already exists.');
}

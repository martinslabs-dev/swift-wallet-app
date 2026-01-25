
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";

// A placeholder for the real service implementation
const WalletConnectService = {
    initialized: false,
    web3wallet: null,

    async initialize() {
        if (this.initialized) {
            console.log("WalletConnect already initialized.");
            return;
        }

        try {
            const core = new Core({
                // logger: "debug",
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            });

            this.web3wallet = await Web3Wallet.init({
                core,
                metadata: {
                    name: "My Crypto Wallet",
                    description: "A crypto wallet with Relay.link features",
                    url: "https://my-crypto-wallet.com",
                    icons: ["https://my-crypto-wallet.com/icon.png"],
                },
            });

            this.initialized = true;
            console.log("WalletConnect initialized successfully");

            this.setupEventListeners();

        } catch (error) {
            console.error("Failed to initialize WalletConnect:", error);
        }
    },

    setupEventListeners() {
        if (!this.web3wallet) return;

        this.web3wallet.on("session_proposal", (proposal) => {
            console.log("WC V2 Event: session_proposal", proposal);
            // This is where you would trigger a UI modal to approve/reject the session
            // For now, we'll log it.
        });

        this.web3wallet.on("session_request", (event) => {
            console.log("WC V2 Event: session_request", event);
            // This is where you would handle requests like 'eth_sendTransaction'
            // and show a confirmation modal to the user.
        });

        this.web3wallet.on("session_ping", (ping) => {
            console.log("WC V2 Event: session_ping", ping);
        });

        this.web3wallet.on("session_event", (event) => {
            console.log("WC V2 Event: session_event", event);
        });

        this.web3wallet.on("session_update", (update) => {
            console.log("WC V2 Event: session_update", update);
        });

        this.web3wallet.on("session_delete", (del) => {
            console.log("WC V2 Event: session_delete", del);
            // This is where you would update your UI to show the session has ended.
        });
    },

    async pair(uri) {
        if (!this.web3wallet) {
            throw new Error("WalletConnect is not initialized.");
        }
        return await this.web3wallet.core.pairing.pair({ uri });
    },

    async approveSession(proposal, accounts) {
        if (!this.web3wallet) {
            throw new Error("WalletConnect is not initialized.");
        }

        const { id, params } = proposal;
        const { requiredNamespaces } = params;

        // The `namespaces` to be approved will depend on the chains/methods supported by your wallet.
        const namespaces = {};

        Object.keys(requiredNamespaces).forEach(key => {
            const accountsForChain = accounts.filter(acc => acc.startsWith(key));
            namespaces[key] = {
                accounts: accountsForChain,
                methods: requiredNamespaces[key].methods, // Grant all requested methods
                events: requiredNamespaces[key].events, // Grant all requested events
            };
        });

        const session = await this.web3wallet.approveSession({
            id,
            namespaces
        });

        console.log("Session approved:", session);
        return session;
    },

    async rejectSession(proposal) {
        if (!this.web3wallet) {
            throw new Error("WalletConnect is not initialized.");
        }
        const { id } = proposal;
        return await this.web3wallet.rejectSession({
            id,
            reason: {
                code: 5000,
                message: "User rejected.",
            },
        });
    },

    getActiveSessions() {
        if (!this.web3wallet) return {};
        return this.web3wallet.getActiveSessions();
    },

    async respondSessionRequest({ topic, response }) {
        if (!this.web3wallet) return;
        return await this.web3wallet.respondSessionRequest({ topic, response });
    },

    async disconnectSession(topic) {
        if (!this.web3wallet) {
            throw new Error("WalletConnect is not initialized.");
        }
        await this.web3wallet.disconnectSession({
            topic,
            reason: {
                code: 6000,
                message: "User disconnected.",
            },
        });
    }
};

export default WalletConnectService;

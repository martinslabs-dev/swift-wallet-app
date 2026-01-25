
// TODO: Replace this with the actual Relay.link API endpoint from their documentation.
const RELAY_API_BASE_URL = 'https://api.relay.link/v1'; 

/**
 * Fetches a quote for a bridge or swap transaction from the Relay.link API.
 * 
 * @param {object} params - The parameters for the quote.
 * @returns {Promise<object>} A promise that resolves to the quote object from the API.
 */
const getQuote = async (params) => {
    const endpoint = `${RELAY_API_BASE_URL}/quote`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Unknown API error' }));
            throw new Error(`Failed to fetch quote: ${errorBody.message} (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Relay.link quote:', error);
        throw error;
    }
};

/**
 * Executes a transaction using the data from a retrieved quote.
 * 
 * @param {object} quote - The quote object received from the getQuote function.
 * @param {string} signedTransaction - The transaction, signed by the user's wallet.
 * @returns {Promise<object>} A promise that resolves to the final transaction result from the API.
 */
const executeTransaction = async (quote, signedTransaction) => {
    const endpoint = `${RELAY_API_BASE_URL}/execute`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quoteId: quote.id,
                signedTransaction: signedTransaction,
            }),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Unknown API error' }));
            throw new Error(`Failed to execute transaction: ${errorBody.message} (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error executing Relay.link transaction:', error);
        throw error;
    }
}

/**
 * Constructs a transaction for a cross-chain contract call (a "pay" operation).
 *
 * @param {object} params - The parameters for the pay transaction.
 * @returns {Promise<object>} A promise that resolves to a transaction request object.
 */
const getPayTransaction = async (params) => {
    const endpoint = `${RELAY_API_BASE_URL}/pay`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Unknown API error' }));
            throw new Error(`Failed to create pay transaction: ${errorBody.message} (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating Relay.link pay transaction:', error);
        throw error;
    }
};


export const relayService = {
    getQuote,
    executeTransaction,
    getPayTransaction,
};


import axios from 'axios';

const API_BASE_URL = 'https://li.quest/v1';

/**
 * Fetches all supported chains from the LI.FI API.
 * @returns {Promise<object[]>} A promise that resolves to an array of chain objects.
 */
export const getChains = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chains`);
    return response.data.chains;
  } catch (error) {
    console.error('Error fetching LI.FI chains:', error.response?.data || error.message);
    throw new Error(`Failed to fetch LI.FI chains: ${error.message}`);
  }
};

/**
 * Fetches all supported tokens from the LI.FI API.
 * @param {number[]} [chains] - Optional array of chain IDs to filter tokens by.
 * @returns {Promise<object>} A promise that resolves to an object where keys are chain IDs
 * and values are arrays of token objects for that chain.
 */
export const getTokens = async (chains) => {
  try {
    const params = {};
    if (chains && chains.length > 0) {
      params.chains = chains.join(',');
    }
    const response = await axios.get(`${API_BASE_URL}/tokens`, { params });
    return response.data.tokens;
  } catch (error) {
    console.error('Error fetching LI.FI tokens:', error.response?.data || error.message);
    throw new Error(`Failed to fetch LI.FI tokens: ${error.message}`);
  }
};

/**
 * Fetches a quote for a cross-chain swap from the LI.FI API.
 * @param {object} params - The parameters for the quote.
 * @returns {Promise<object>} A promise that resolves to a quote object.
 */
export const getQuote = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/quote`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching LI.FI quote:', error.response?.data || error.message);
    throw new Error(`Failed to fetch LI.FI quote: ${error.message}`);
  }
};

export const lifiService = {
  getChains,
  getTokens,
  getQuote,
};

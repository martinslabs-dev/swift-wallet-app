
import axios from 'axios';

const API_BASE_URL = '/api/marketData';

/**
 * Fetches market data for a given list of cryptocurrency IDs from CoinGecko through the local proxy.
 * @param {string[]} coinIds - An array of CoinGecko coin IDs (e.g., ['bitcoin', 'ethereum']).
 * @returns {Promise<object[]>} A promise that resolves to an array of market data objects.
 */
export const getMarketData = async (coinIds) => {
  if (!coinIds || coinIds.length === 0) {
    return [];
  }

  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        coinIds: coinIds.join(','),
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Error fetching market data via proxy:', errorMessage);
    throw new Error(`Failed to fetch market data: ${errorMessage}`);
  }
};

/**
 * Fetches the top 100 cryptocurrencies by market cap.
 * @returns {Promise<object[]>} A promise that resolves to an array of market data objects.
 */
export const getTopTokens = async () => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        getTopTokens: true,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Error fetching top tokens via proxy:', errorMessage);
    throw new Error(`Failed to fetch top tokens: ${errorMessage}`);
  }
};

export const cryptoDataService = {
  getMarketData,
  getTopTokens,
};

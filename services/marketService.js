
import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches market data for a given set of token IDs.
 * @param {string[]} tokenIds - An array of CoinGecko token IDs (e.g., ['bitcoin', 'ethereum']).
 * @returns {Promise<object>} A promise that resolves to an object mapping token IDs to their market data.
 */
export const getMarketData = async (tokenIds) => {
  if (!tokenIds || tokenIds.length === 0) {
    return {};
  }

  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenIds.join(','),
        vs_currencies: 'usd',
        include_market_cap: 'true',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching market data from CoinGecko:', error);
    return {};
  }
};

/**
 * Fetches historical market data for a given token ID.
 * @param {string} tokenId - A CoinGecko token ID (e.g., 'bitcoin').
 * @param {number} days - The number of days to fetch historical data for.
 * @returns {Promise<object>} A promise that resolves to the historical market data.
 */
export const getChartData = async (tokenId, days = 7) => {
  if (!tokenId) {
    return null;
  }

  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${tokenId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching chart data from CoinGecko:', error);
    return null;
  }
};

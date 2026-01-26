
import axios from 'axios';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const cache = {
  topTokens: {
    data: null,
    timestamp: 0,
  },
  coinData: {},
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const { coinIds, getTopTokens } = req.query;
  const now = Date.now();

  try {
    if (getTopTokens) {
      if (now - cache.topTokens.timestamp < CACHE_DURATION) {
        return res.status(200).json(cache.topTokens.data);
      }
    } else if (coinIds) {
      const requestedCoinIds = coinIds.split(',');
      const cachedData = {};
      const idsToFetch = [];

      for (const id of requestedCoinIds) {
        if (cache.coinData[id] && now - cache.coinData[id].timestamp < CACHE_DURATION) {
          cachedData[id] = cache.coinData[id].data;
        } else {
          idsToFetch.push(id);
        }
      }

      if (idsToFetch.length === 0) {
        return res.status(200).json(Object.values(cachedData));
      }
    }

    let params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    };

    if (coinIds) {
      params.ids = coinIds;
      params.per_page = coinIds.split(',').length;
    } else if (getTopTokens) {
      params.per_page = 100;
    } else {
      return res.status(400).json({ error: 'Either coinIds or getTopTokens parameter is required' });
    }

    const response = await axios.get(`${API_BASE_URL}/coins/markets`, { params });

    if (getTopTokens) {
      cache.topTokens.data = response.data;
      cache.topTokens.timestamp = now;
    } else if (coinIds) {
      response.data.forEach(coin => {
        cache.coinData[coin.id] = {
          data: coin,
          timestamp: now,
        };
      });
    }

    res.status(200).json(response.data);

  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Error fetching CoinGecko market data in proxy:', errorMessage);
    res.status(error.response?.status || 500).json({ error: `Failed to fetch market data: ${errorMessage}` });
  }
}

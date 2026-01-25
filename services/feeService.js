
import { ethers } from 'ethers';

const FEE_LEVELS = {
  low: { maxPriorityFeePerGas: 1, maxFeePerGas: 20 },      // Slow
  medium: { maxPriorityFeePerGas: 2, maxFeePerGas: 40 }, // Normal
  high: { maxPriorityFeePerGas: 3, maxFeePerGas: 60 },      // Fast
};

async function getEthPriceInUSD() {
  try {
    // Using a public API for price conversion. Consider a more reliable, authenticated API for production.
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Could not fetch ETH price:", error);
    return 3000; // Return a fallback/default price
  }
}

export async function getFeeEstimates(rpcUrl) {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const feeData = await provider.getFeeData();
    const ethPrice = await getEthPriceInUSD();

    const estimatedGasLimit = 21000n; // Standard gas limit for a basic ETH transfer

    const feeOptions = Object.keys(FEE_LEVELS).map(level => {
      const { maxPriorityFeePerGas, maxFeePerGas } = FEE_LEVELS[level];
      const calculatedMaxFeePerGas = feeData.gasPrice ? feeData.gasPrice + ethers.parseUnits(maxFeePerGas.toString(), 'gwei') : ethers.parseUnits(maxFeePerGas.toString(), 'gwei');
      const calculatedMaxPriorityFee = ethers.parseUnits(maxPriorityFeePerGas.toString(), 'gwei');
      
      const totalFee = (calculatedMaxFeePerGas) * estimatedGasLimit;
      const feeEth = ethers.formatEther(totalFee);
      const feeUsd = (parseFloat(feeEth) * ethPrice).toFixed(2);

      return {
        level,
        feeEth: `~${parseFloat(feeEth).toPrecision(3)}`,
        feeUsd,
        gasPrice: calculatedMaxFeePerGas,
        maxPriorityFeePerGas: calculatedMaxPriorityFee,
      };
    });

    return feeOptions;
  } catch (error) {
    console.error('Error fetching EIP-1559 fee estimates:', error);
    // Fallback for non EIP-1559 networks or other errors
    return await getLegacyFeeEstimates(rpcUrl);
  }
}

async function getLegacyFeeEstimates(rpcUrl) {
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const gasPrice = (await provider.getFeeData()).gasPrice;
        const ethPrice = await getEthPriceInUSD();
        const estimatedGasLimit = 21000n;

        const feeOptions = Object.keys(FEE_LEVELS).map(level => {
            const multiplier = level === 'low' ? 0.8 : level === 'medium' ? 1 : 1.2;
            const adjustedGasPrice = BigInt(Math.round(Number(gasPrice) * multiplier));
            const totalFee = adjustedGasPrice * estimatedGasLimit;
            const feeEth = ethers.formatEther(totalFee);
            const feeUsd = (parseFloat(feeEth) * ethPrice).toFixed(2);

            return {
                level,
                feeEth: `~${parseFloat(feeEth).toPrecision(3)}`,
                feeUsd,
                gasPrice: adjustedGasPrice,
            };
        });
        return feeOptions;
    } catch(error) {
        console.error('Error fetching legacy fee estimates:', error);
        return []; // Return empty if all fails
    }
}

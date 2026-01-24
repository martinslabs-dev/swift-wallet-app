
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getChartData } from '../../services/marketService';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/80 p-2 rounded-md border border-gray-700 shadow-lg">
                <p className="text-sm text-white font-bold">{`$${payload[0].value.toFixed(2)}`}</p>
                <p className="text-xs text-gray-400">{new Date(label).toLocaleDateString()}</p>
            </div>
        );
    }
    return null;
};

const PriceChart = ({ tokenId }) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChart = async () => {
            if (!tokenId) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await getChartData(tokenId, 7);
                if (data && data.prices) {
                    const formattedData = data.prices.map(pricePoint => ({
                        date: pricePoint[0],
                        price: pricePoint[1],
                    }));
                    setChartData(formattedData);
                } else {
                    throw new Error('No price data available.');
                }
            } catch (e) {
                setError('Could not load chart data.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChart();
    }, [tokenId]);

    if (isLoading) {
        return <div className="h-48 flex items-center justify-center text-gray-500">Loading Chart...</div>;
    }

    if (error) {
        return <div className="h-48 flex items-center justify-center text-red-500">{error}</div>;
    }

    if (!chartData || chartData.length === 0) {
        return <div className="h-48 flex items-center justify-center text-gray-500">No chart data available.</div>;
    }

    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));

    return (
        <ResponsiveContainer width="100%" height={192}> 
            <LineChart 
                data={chartData} 
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
                <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis hide={true} domain={[minPrice, maxPrice]} />
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#4B5563', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8B5CF6" 
                    strokeWidth={2} 
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PriceChart;

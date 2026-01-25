
import React from 'react';
import { FiZap } from 'react-icons/fi';

const FeeSelector = ({ feeOptions, selectedFee, onFeeSelect, network }) => {
    if (!feeOptions || feeOptions.length === 0) return null;

    const getFeeLabel = (level) => {
        switch(level) {
            case 'low': return 'Slow';
            case 'medium': return 'Normal';
            case 'high': return 'Fast';
            default: return 'Unknown';
        }
    }

    return (
        <div className="my-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                <FiZap className="mr-2 text-cyan-400"/> Network Fee
            </h3>
            <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-2 rounded-xl">
                {feeOptions.map((option) => (
                    <button
                        key={option.level}
                        onClick={() => onFeeSelect(option.level)}
                        className={`px-4 py-3 rounded-lg text-center transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
                            selectedFee === option.level
                                ? 'bg-cyan-600/90 text-white shadow-lg'
                                : 'bg-slate-700/50 hover:bg-slate-700'
                        }`}
                    >
                        <p className="font-bold text-sm capitalize">{getFeeLabel(option.level)}</p>
                        <p className="text-xs text-slate-300 mt-1">~{option.feeEth} {network.nativeCurrency.symbol}</p>
                        <p className="text-xs text-slate-400">(${option.feeUsd})</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FeeSelector;

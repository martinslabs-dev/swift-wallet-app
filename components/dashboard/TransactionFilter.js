
import React, { useState, useMemo } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import Select from 'react-select';

const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: '#1f2937', // gray-800
        borderColor: '#374151', // gray-700
        borderRadius: '0.5rem',
        minHeight: '42px',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#1f2937', // gray-800
        borderColor: '#374151', // gray-700
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#374151' : '#1f2937', // gray-700 on focus
        color: 'white',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'white',
    }),
    input: (provided) => ({
        ...provided,
        color: 'white',
    }),
};

const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
];

const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'send', label: 'Send' },
    { value: 'receive', label: 'Receive' },
    { value: 'swap', label: 'Swap' },
];

const TransactionFilter = ({ onFilterChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState(statusOptions[0]);
    const [type, setType] = useState(typeOptions[0]);

    const handleFilter = () => {
        onFilterChange({
            term: searchTerm,
            status: status.value,
            type: type.value,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatus(statusOptions[0]);
        setType(typeOptions[0]);
        onFilterChange({ term: '', status: 'all', type: 'all' });
    };

    return (
        <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="relative col-span-1 md:col-span-2">
                    <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by address or amount..."
                        className="bg-slate-700/50 border border-slate-600 rounded-lg w-full pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Status</label>
                    <Select options={statusOptions} value={status} onChange={setStatus} styles={customStyles} />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Type</label>
                    <Select options={typeOptions} value={type} onChange={setType} styles={customStyles} />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
                 <button 
                    onClick={clearFilters} 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <FiX /> Clear
                </button>
                <button 
                    onClick={handleFilter} 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default TransactionFilter;

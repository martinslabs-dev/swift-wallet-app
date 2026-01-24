import React from 'react';

const ActionButton = ({ onClick, label, icon: Icon, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex flex-col items-center justify-center space-y-2 w-full p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <div className="p-2.5 bg-blue-500 rounded-full">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        </button>
    );
};

export default ActionButton;

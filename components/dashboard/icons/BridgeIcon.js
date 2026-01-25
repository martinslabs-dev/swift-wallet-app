import React from 'react';

const BridgeIcon = ({ isActive }) => {
    const color = isActive ? "#00D1FF" : "#8A8A8E";
    return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_80_90)">
                {/* Block 1 (Top Left) */}
                <rect x="3" y="4" width="10" height="6" rx="1" stroke={color} strokeWidth="1.5"/>

                {/* Block 2 (Bottom Right) */}
                <rect x="15" y="18" width="10" height="6" rx="1" stroke={color} strokeWidth="1.5"/>

                {/* Arrow from Block 1 to Block 2 */}
                <path d="M8 10V14.5C8 15.6046 8.89543 16.5 10 16.5H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 14.5L18 16.5L16 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
                <clipPath id="clip0_80_90">
                    <rect width="28" height="28" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    );
};

export default BridgeIcon;

import React from 'react';
import './BentoBox.css';

const BentoBox = ({ children, className = '', glowColor = '' }) => {
    const dynamicStyle = glowColor ? {
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 20px -10px ${glowColor}`
    } : {};

    return (
        <div
            className={`glass-panel bento-box ${className}`}
            style={dynamicStyle}
        >
            {children}
        </div>
    );
};

export default BentoBox;

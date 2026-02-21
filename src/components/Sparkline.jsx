import React from 'react';

const Sparkline = ({ data = [], color = 'var(--accent-cyan)', width = 60, height = 24, strokeWidth = 2 }) => {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const paddingY = strokeWidth;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = ((height - paddingY * 2) - ((val - min) / range) * (height - paddingY * 2)) + paddingY;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline-svg">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                style={{
                    filter: `drop-shadow(0 2px 3px ${color}80)`
                }}
            />
        </svg>
    );
};

export default Sparkline;

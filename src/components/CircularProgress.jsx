import React from 'react';
import './CircularProgress.css';

const CircularProgress = ({
    percentage = 0,
    size = 120,
    strokeWidth = 8,
    color = 'var(--accent-cyan)',
    isNearingDeadline = false
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`circular-progress-container ${isNearingDeadline ? 'nearing-deadline' : ''}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="circular-progress-svg">
                {/* Background track */}
                <circle
                    stroke="var(--glass-border)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress track */}
                <circle
                    className="circular-progress-fill"
                    stroke={color}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset: offset }}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="circular-progress-text">
                <span style={{
                    fontSize: size * 0.25,
                    fontWeight: 700,
                    color,
                    textShadow: `0 0 10px ${color}80`
                }}>
                    {percentage}%
                </span>
            </div>
        </div>
    );
};

export default CircularProgress;

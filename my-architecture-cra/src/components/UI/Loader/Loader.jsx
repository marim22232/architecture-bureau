import React from 'react';
import './Loader.css';

const Loader = ({ type = 'spinner', size = 'medium', text = '', color = '#667eea' }) => {
    const renderLoader = () => {
        switch (type) {
            case 'spinner':
                return <div className="loader-spinner" style={{ borderTopColor: color }}></div>;
            
            case 'pulse':
                return <div className="loader-pulse" style={{ backgroundColor: color }}></div>;
            
            case 'dots':
                return (
                    <div className="loader-dots">
                        <span className="dot" style={{ backgroundColor: color }}></span>
                        <span className="dot" style={{ backgroundColor: color }}></span>
                        <span className="dot" style={{ backgroundColor: color }}></span>
                    </div>
                );
            
            case 'ripple':
                return (
                    <div className="loader-ripple">
                        <div style={{ borderColor: color }}></div>
                        <div style={{ borderColor: color }}></div>
                    </div>
                );
            
            case 'progress':
                return (
                    <div className="loader-progress">
                        <div className="progress-bar" style={{ backgroundColor: color }}></div>
                    </div>
                );
            
            default:
                return <div className="loader-spinner" style={{ borderTopColor: color }}></div>;
        }
    };

    return (
        <div className={`loader-container loader-${size}`}>
            {renderLoader()}
            {text && <p className="loader-text" style={{ color: color }}>{text}</p>}
        </div>
    );
};

export default Loader;
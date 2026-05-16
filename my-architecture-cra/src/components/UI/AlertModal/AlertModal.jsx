// components/UI/AlertModal/AlertModal.jsx
import React from 'react';
import './AlertModal.css';

const AlertModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="alert-overlay" onClick={onClose}>
            <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="alert-title">{title || 'Уведомление'}</h3>
                <p className="alert-message">{message}</p>
                <div className="alert-buttons">
                    <button className="alert-btn-ok" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
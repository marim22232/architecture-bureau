// components/UI/ConfirmModal/ConfirmModal.jsx
import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onClose}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="confirm-title">{title || 'Подтверждение'}</h3>
                <p className="confirm-message">{message}</p>
                <div className="confirm-buttons">
                    <button className="confirm-btn-cancel" onClick={onClose}>Нет</button>
                    <button className="confirm-btn-ok" onClick={onConfirm}>Да</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
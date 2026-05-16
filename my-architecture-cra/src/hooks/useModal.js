// hooks/useModal.js
import { useState } from 'react';
import ConfirmModal from '../components/UI/ConfirmModal/ConfirmModal';
import AlertModal from '../components/UI/AlertModal/AlertModal';

export const useModal = () => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    const showConfirm = (message, onConfirm, title = 'Подтверждение') => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm
        });
    };

    const showAlert = (message, title = 'Уведомление') => {
        setAlertState({
            isOpen: true,
            title,
            message
        });
    };

    const closeConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    const ConfirmModalComponent = () => (
        <ConfirmModal
            isOpen={confirmState.isOpen}
            onClose={closeConfirm}
            onConfirm={() => {
                if (confirmState.onConfirm) confirmState.onConfirm();
                closeConfirm();
            }}
            title={confirmState.title}
            message={confirmState.message}
        />
    );

    const AlertModalComponent = () => (
        <AlertModal
            isOpen={alertState.isOpen}
            onClose={closeAlert}
            title={alertState.title}
            message={alertState.message}
        />
    );

    return { showConfirm, showAlert, ConfirmModalComponent, AlertModalComponent };
};
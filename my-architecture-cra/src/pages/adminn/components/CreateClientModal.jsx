// my-architecture-cra/src/pages/adminn/components/CreateClientModal.jsx
import React, { useState } from 'react';
import MyButton from '../../../components/UI/MyButton/MyButton';
import MyInput from '../../../components/UI/MyInput/MyInput';
import Typography from '../../../components/UI/Typography/Typography';
import Icons from '../../../components/UI/Icons/Icons';
import './UserEditModal.css';

const CreateClientModal = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        patronymic: '',
        companyName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.email) {
            setError('Email обязателен для заполнения');
            return;
        }
        
        setLoading(true);
        try {
            await onSave(formData);
        } catch (err) {
            setError(err.message || 'Ошибка при создании');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <Typography variant="h3" weight="bold">
                        ➕ Создание нового клиента
                    </Typography>
                    <button className="close-btn" onClick={onClose}>
                        <Icons.Close size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="info-message" style={{ background: '#ffebee', color: '#c62828', marginBottom: '20px' }}>
                            <Icons.Close size={18} />
                            <Typography variant="small">{error}</Typography>
                        </div>
                    )}

                    <div className="form-section">
                        <Typography variant="h4" weight="semibold" style={{ marginBottom: '15px' }}>
                            📧 Данные для входа
                        </Typography>
                        
                        <div className="form-group">
                            <label>Email *</label>
                            <MyInput 
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="client@example.com"
                            />
                            <Typography variant="small" color="secondary" style={{ marginTop: '4px', display: 'block' }}>
                                На этот email будет отправлено приглашение
                            </Typography>
                        </div>
                    </div>

                    <div className="form-section">
                        <Typography variant="h4" weight="semibold" style={{ marginBottom: '15px' }}>
                            👤 Личная информация
                        </Typography>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Имя</label>
                                <MyInput 
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    placeholder="Имя"
                                />
                            </div>
                            <div className="form-group">
                                <label>Фамилия</label>
                                <MyInput 
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    placeholder="Фамилия"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Отчество</label>
                            <MyInput 
                                type="text"
                                value={formData.patronymic}
                                onChange={(e) => handleChange('patronymic', e.target.value)}
                                placeholder="Отчество"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <Typography variant="h4" weight="semibold" style={{ marginBottom: '15px' }}>
                            🏢 Информация о компании
                        </Typography>
                        
                        <div className="form-group">
                            <label>Название компании</label>
                            <MyInput 
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                placeholder="ООО Архитектура"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Телефон</label>
                            <MyInput 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+7 (999) 123-45-67"
                            />
                        </div>
                    </div>

                    <div className="info-message">
                        <Icons.User size={18} />
                        <Typography variant="small">
                            После создания клиенту будет отправлен email с ссылкой для создания пароля.
                        </Typography>
                    </div>
                </div>

                <div className="modal-footer">
                    <MyButton variant="secondary" onClick={onClose}>
                        Отмена
                    </MyButton>
                    <MyButton variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Создание...' : '✅ Создать клиента'}
                    </MyButton>
                </div>
            </div>
        </div>
    );
};

export default CreateClientModal;
// my-architecture-cra/src/pages/adminn/components/UserEditModal.jsx
import React, { useState } from 'react';
import MyButton from '../../../components/UI/MyButton/MyButton';
import MyInput from '../../../components/UI/MyInput/MyInput';
import MyTextarea from '../../../components/UI/MyTextarea/MyTextarea';
import Typography from '../../../components/UI/Typography/Typography';
import Icons from '../../../components/UI/Icons/Icons';
import './UserEditModal.css';

const UserEditModal = ({ account, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        account: {
            roleId: account.role?.id || 1,
            isActive: account.isActive,
            isEmailVerified: account.isEmailVerified
        },
        profile: { ...account.profile }
    });
    const [loading, setLoading] = useState(false);

    const handleAccountChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            account: { ...prev.account, [field]: value }
        }));
    };

    const handleProfileChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            profile: { ...prev.profile, [field]: value }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSave(account.id, formData.account, formData.profile);
        } finally {
            setLoading(false);
        }
    };

    const getRoleOptions = () => {
        const options = [
            { id: 1, name: 'Пользователь (клиент)' },
            { id: 2, name: 'Архитектор' },
            { id: 3, name: 'Менеджер' },
            { id: 4, name: 'Администратор' }
        ];
        return options;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <Typography variant="h3" weight="bold">
                        ✏️ Редактирование аккаунта
                    </Typography>
                    <button className="close-btn" onClick={onClose}>
                        <Icons.Close size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Данные аккаунта */}
                    <div className="form-section">
                        <Typography variant="h4" weight="semibold" style={{ marginBottom: '15px' }}>
                            📧 Данные аккаунта
                        </Typography>
                        
                        <div className="form-group">
                            <label>Email</label>
                            <MyInput 
                                type="email" 
                                value={account.email} 
                                disabled={true}
                                style={{ background: '#f5f5f5' }}
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Роль</label>
                                <select 
                                    value={formData.account.roleId}
                                    onChange={(e) => handleAccountChange('roleId', parseInt(e.target.value))}
                                    className="custom-select"
                                >
                                    {getRoleOptions().map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Статус</label>
                                <select 
                                    value={formData.account.isActive ? 'active' : 'inactive'}
                                    onChange={(e) => handleAccountChange('isActive', e.target.value === 'active')}
                                    className="custom-select"
                                >
                                    <option value="active">✅ Активен</option>
                                    <option value="inactive">❌ Заблокирован</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Подтверждение email</label>
                                <select 
                                    value={formData.account.isEmailVerified ? 'verified' : 'unverified'}
                                    onChange={(e) => handleAccountChange('isEmailVerified', e.target.value === 'verified')}
                                    className="custom-select"
                                >
                                    <option value="verified">✅ Подтверждён</option>
                                    <option value="unverified">⚠️ Не подтверждён</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Данные клиента */}
                    {formData.profile.type === 'client' && (
                        <div className="form-section">
                            <Typography variant="h4" weight="semibold" style={{ marginBottom: '15px' }}>
                                👤 Данные клиента
                            </Typography>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Имя</label>
                                    <MyInput 
                                        type="text"
                                        value={formData.profile.firstName || ''}
                                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                                        placeholder="Имя"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Фамилия</label>
                                    <MyInput 
                                        type="text"
                                        value={formData.profile.lastName || ''}
                                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                                        placeholder="Фамилия"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Отчество</label>
                                <MyInput 
                                    type="text"
                                    value={formData.profile.patronymic || ''}
                                    onChange={(e) => handleProfileChange('patronymic', e.target.value)}
                                    placeholder="Отчество"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Название компании</label>
                                <MyInput 
                                    type="text"
                                    value={formData.profile.companyName || ''}
                                    onChange={(e) => handleProfileChange('companyName', e.target.value)}
                                    placeholder="Название компании"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Телефон</label>
                                <MyInput 
                                    type="tel"
                                    value={formData.profile.phone || ''}
                                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                                    placeholder="+7 (999) 123-45-67"
                                />
                            </div>
                        </div>
                    )}

                    {/* Данные сотрудника */}
                    {formData.profile.type === 'team' && (
                        <div className="form-section">
                            <Typography variant="h4" weight="semibold" style={{ marginBottom: '15px' }}>
                                👨‍💼 Данные сотрудника
                            </Typography>
                            
                            <div className="form-group">
                                <label>ФИО</label>
                                <MyInput 
                                    type="text"
                                    value={formData.profile.name || ''}
                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                    placeholder="Полное имя"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Должность</label>
                                    <MyInput 
                                        type="text"
                                        value={formData.profile.position || ''}
                                        onChange={(e) => handleProfileChange('position', e.target.value)}
                                        placeholder="Должность"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Специализация</label>
                                    <MyInput 
                                        type="text"
                                        value={formData.profile.specialization || ''}
                                        onChange={(e) => handleProfileChange('specialization', e.target.value)}
                                        placeholder="Специализация"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Телефон</label>
                                <MyInput 
                                    type="tel"
                                    value={formData.profile.phone || ''}
                                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                                    placeholder="Телефон"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>О себе</label>
                                <MyTextarea
                                    value={formData.profile.bio || ''}
                                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                                    rows="3"
                                    placeholder="Краткая информация о сотруднике"
                                />
                            </div>
                        </div>
                    )}

                    {/* Обычный пользователь */}
                    {formData.profile.type === 'user' && (
                        <div className="info-message">
                            <Icons.User size={20} />
                            <Typography variant="small">
                                У этого пользователя нет заполненного профиля (не клиент и не сотрудник).
                                Чтобы добавить профиль, создайте клиента через кнопку "Создать клиента".
                            </Typography>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <MyButton variant="secondary" onClick={onClose}>
                        Отмена
                    </MyButton>
                    <MyButton variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Сохранение...' : '💾 Сохранить изменения'}
                    </MyButton>
                </div>
            </div>
        </div>
    );
};

export default UserEditModal;
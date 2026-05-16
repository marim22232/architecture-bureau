// src/components/Auth/ProfileModal/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import './ProfileModal.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton';
import Icons from '../../UI/Icons/Icons';
import { profileAPI } from '../../../services/api';

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('user'); // 'user', 'client', 'team'
    const [profileData, setProfileData] = useState({
        // Общие поля
        email: '',
        
        // Для клиентов
        firstName: '',
        lastName: '',
        patronymic: '',
        phone: '',
        companyName: '',
        
        // Для сотрудников (team)
        name: '',
        position: '',
        photo: '',
        specialization: '',
        experienceYears: 0,
        projectsCount: 0,
        awards: '',
        education: '',
        birthDate: '',
        telegram: '',
        linkedin: '',
        softwareSkills: ''
    });
    
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            loadProfileData();
        }
    }, [isOpen, user]);

    const loadProfileData = async () => {
        setIsLoading(true);
        try {
            const result = await profileAPI.getProfile();
            if (result.success) {
                const data = result.user;
                setUserType(data.userType || 'user');
                
                const profile = data.profile || {};
                
                let newData = { email: data.email || '' };
                
                if (data.userType === 'team') {
                    // Данные для сотрудника
                    newData = {
                        ...newData,
                        name: profile.name || '',
                        position: profile.position || '',
                        photo: profile.photo || '',
                        specialization: profile.specialization || '',
                        experienceYears: profile.experience_years || 0,
                        projectsCount: profile.projects_count || 0,
                        awards: profile.awards || '',
                        education: profile.education || '',
                        birthDate: profile.birth_date ? profile.birth_date.split('T')[0] : '',
                        telegram: profile.telegram || '',
                        linkedin: profile.linkedin || '',
                        softwareSkills: profile.software_skills || ''
                    };
                } else if (data.userType === 'client') {
                    // Данные для клиента
                    newData = {
                        ...newData,
                        firstName: profile.first_name || '',
                        lastName: profile.last_name || '',
                        patronymic: profile.patronymic || '',
                        phone: profile.phone || '',
                        companyName: profile.company_name || ''
                    };
                } else {
                    // Обычный пользователь
                    newData = {
                        ...newData
                    };
                }
                
                setProfileData(newData);
                setOriginalData(newData);
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSave = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
        const updateData = {};
        
        if (userType === 'team') {
            // Отправляем ВСЕ поля, которые могут измениться
            if (profileData.name !== originalData.name) updateData.name = profileData.name;
            if (profileData.position !== originalData.position) updateData.position = profileData.position;
            if (profileData.specialization !== originalData.specialization) updateData.specialization = profileData.specialization;
            if (profileData.telegram !== originalData.telegram) updateData.telegram = profileData.telegram;
            if (profileData.linkedin !== originalData.linkedin) updateData.linkedin = profileData.linkedin;
            
            // ⭐ ДОБАВЛЯЕМ ОТСУТСТВУЮЩИЕ ПОЛЯ
            if (profileData.birthDate !== originalData.birthDate) updateData.birthDate = profileData.birthDate;
            if (profileData.education !== originalData.education) updateData.education = profileData.education;
            if (profileData.awards !== originalData.awards) updateData.awards = profileData.awards;
            if (profileData.experienceYears !== originalData.experienceYears) updateData.experienceYears = profileData.experienceYears;
            if (profileData.projectsCount !== originalData.projectsCount) updateData.projectsCount = profileData.projectsCount;
            if (profileData.softwareSkills !== originalData.softwareSkills) updateData.softwareSkills = profileData.softwareSkills;
            
        } else if (userType === 'client') {
            if (profileData.firstName !== originalData.firstName) updateData.firstName = profileData.firstName;
            if (profileData.lastName !== originalData.lastName) updateData.lastName = profileData.lastName;
            if (profileData.patronymic !== originalData.patronymic) updateData.patronymic = profileData.patronymic;
            if (profileData.phone !== originalData.phone) updateData.phone = profileData.phone;
            if (profileData.companyName !== originalData.companyName) updateData.companyName = profileData.companyName;
        }
        
        // Если нет изменений
        if (Object.keys(updateData).length === 0) {
            setSuccessMessage('Нет изменений для сохранения');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 2000);
            setIsLoading(false);
            return;
        }
        
        console.log('📤 Отправляем на сервер:', updateData);
        
        const result = await profileAPI.updateProfile(updateData);
        
        console.log('📥 Ответ сервера:', result);
        
        if (result.success) {
            // Обновляем originalData новыми значениями
            setOriginalData({ ...profileData });
            setSuccessMessage('Профиль успешно обновлён!');
            setIsEditing(false);
            
            // Передаём обновлённые данные в родительский компонент
            if (onUpdate) {
                onUpdate({
                    ...profileData,
                    userType: userType
                });
            }
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setErrors({ general: result.message || 'Ошибка сохранения профиля' });
        }
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        setErrors({ general: 'Ошибка сохранения профиля' });
    } finally {
        setIsLoading(false);
    }
};

    if (!isOpen) return null;

    // Рендер для сотрудника (team)
    const renderTeamFields = () => (
        <>
            <div className="profile-section">
                <div className="section-title">
                    <Icons.User size={18} color="#3a5a6a" />
                    <Typography variant="body" weight="bold">Личная информация</Typography>
                </div>
                
                <div className="form-group">
                    <label>ФИО</label>
                    <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Ваше полное имя"
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Должность</label>
                        <input
                            type="text"
                            name="position"
                            value={profileData.position}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Должность"
                        />
                    </div>
                    <div className="form-group">
                        <label>Специализация</label>
                        <input
                            type="text"
                            name="specialization"
                            value={profileData.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Например: Архитектор, Дизайнер"
                        />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Опыт работы (лет)</label>
                        <input
                            type="number"
                            name="experienceYears"
                            value={profileData.experienceYears}
                            onChange={handleChange}
                            disabled={!isEditing}
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label>Реализовано проектов</label>
                        <input
                            type="number"
                            name="projectsCount"
                            value={profileData.projectsCount}
                            onChange={handleChange}
                            disabled={!isEditing}
                            min="0"
                        />
                    </div>
                </div>
            </div>
            
            <div className="profile-section">
                <div className="section-title">
                    <Icons.Calendar size={18} color="#3a5a6a" />
                    <Typography variant="body" weight="bold">Образование и достижения</Typography>
                </div>
                
                <div className="form-group">
                    <label>Образование</label>
                    <textarea
                        name="education"
                        value={profileData.education}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="3"
                        placeholder="ВУЗ, курсы, сертификаты..."
                    />
                </div>
                
                <div className="form-group">
                    <label>Награды и достижения</label>
                    <textarea
                        name="awards"
                        value={profileData.awards}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="3"
                        placeholder="Профессиональные награды..."
                    />
                </div>
                
                <div className="form-group">
                    <label>Программное обеспечение</label>
                    <textarea
                        name="softwareSkills"
                        value={profileData.softwareSkills}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="2"
                        placeholder="AutoCAD, Revit, 3ds Max, Photoshop..."
                    />
                </div>
            </div>
            
            <div className="profile-section">
                <div className="section-title">
                    <Icons.Link size={18} color="#3a5a6a" />
                    <Typography variant="body" weight="bold">Контакты и соцсети</Typography>
                </div>
                
                <div className="form-group">
                    <label>Telegram</label>
                    <input
                        type="text"
                        name="telegram"
                        value={profileData.telegram}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="@username"
                    />
                </div>
                
                <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                        type="text"
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Ссылка на профиль LinkedIn"
                    />
                </div>
            </div>
        </>
    );

    // Рендер для клиента (client)
    const renderClientFields = () => (
        <>
            <div className="profile-section">
                <div className="section-title">
                    <Icons.User size={18} color="#3a5a6a" />
                    <Typography variant="body" weight="bold">Личная информация</Typography>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Имя</label>
                        <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Имя"
                        />
                    </div>
                    <div className="form-group">
                        <label>Фамилия</label>
                        <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Фамилия"
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Отчество</label>
                    <input
                        type="text"
                        name="patronymic"
                        value={profileData.patronymic}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Отчество"
                    />
                </div>
                
                <div className="form-group">
                    <label>Телефон</label>
                    <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="+7 (999) 123-45-67"
                    />
                </div>
            </div>
            
            <div className="profile-section">
                <div className="section-title">
                    <Icons.Building size={18} color="#3a5a6a" />
                    <Typography variant="body" weight="bold">Информация о компании</Typography>
                </div>
                
                <div className="form-group">
                    <label>Название компании</label>
                    <input
                        type="text"
                        name="companyName"
                        value={profileData.companyName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Название организации"
                    />
                </div>
            </div>
        </>
    );

    // Рендер для обычного пользователя
    const renderUserFields = () => (
        <div className="profile-section">
            <div className="section-title">
                <Icons.User size={18} color="#3a5a6a" />
                <Typography variant="body" weight="bold">Основная информация</Typography>
            </div>
            
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={profileData.email}
                    disabled={true}
                    className="readonly"
                />
            </div>
            
            <div className="info-message">
                <Typography variant="small" color="primary">
                    Для заполнения профиля обратитесь к администратору.
                </Typography>
            </div>
        </div>
    );

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="profile-modal-close" onClick={onClose}>✕</button>
                
                <div className="profile-modal-header">
                    <Typography variant="h3" color="dark" weight="bold">
                        {userType === 'team' ? 'Профиль сотрудника' : 
                         userType === 'client' ? 'Профиль клиента' : 'Мой профиль'}
                    </Typography>
                    <Typography variant="small" color="primary">{profileData.email}</Typography>
                </div>
                
                {successMessage && (
                    <div className="profile-success-message">✅ {successMessage}</div>
                )}
                
                {errors.general && (
                    <div className="profile-error-message">❌ {errors.general}</div>
                )}
                
                <div className="profile-modal-content">
                    {/* Email всегда показываем */}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={profileData.email}
                            disabled={true}
                            className="readonly"
                        />
                    </div>
                    
                    {/* Разные поля в зависимости от типа */}
                    {userType === 'team' && renderTeamFields()}
                    {userType === 'client' && renderClientFields()}
                    {userType === 'user' && renderUserFields()}
                </div>
                
                <div className="profile-modal-footer">
                    {userType !== 'user' && (
                        !isEditing ? (
                            <div className="button-group">
                                <MyButton variant="primary" onClick={() => setIsEditing(true)}>
                                    ✏️ Редактировать
                                </MyButton>
                                <MyButton variant="secondary" onClick={onClose}>
                                    Закрыть
                                </MyButton>
                            </div>
                        ) : (
                            <div className="button-group">
                                <MyButton variant="primary" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? 'Сохранение...' : '💾 Сохранить'}
                                </MyButton>
                                <MyButton variant="secondary" onClick={() => {
                                    setProfileData(originalData);
                                    setIsEditing(false);
                                }}>
                                    Отмена
                                </MyButton>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
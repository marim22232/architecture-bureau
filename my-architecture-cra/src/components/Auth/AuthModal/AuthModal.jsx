// src/components/Auth/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton';
import Icons from '../../UI/Icons/Icons';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth.js';

const AuthModal = ({ isOpen, onClose, onSuccess, defaultMode = 'login' }) => {
    const { login, isLoading: authLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const navigate = useNavigate();
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
    const [resetCodeStep, setResetCodeStep] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Закрытие по Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Блокировка скролла
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Сброс формы
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setVerificationStep(false);
        setVerificationCode('');
        setTempEmail('');
        setForgotPasswordStep(false);
        setResetCodeStep(false);
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            rememberMe: false
        });
        setErrors({});
        setShowPassword(false);
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Введите email';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Введите корректный email';
            }
        }

        if (!isLogin && !verificationStep && !forgotPasswordStep) {
            if (!formData.password) {
                newErrors.password = 'Введите пароль';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Пароль должен содержать минимум 6 символов';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Пароли не совпадают';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // РЕГИСТРАЦИЯ
    const handleRegister = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const payload = {
                email: formData.email,
                password: formData.password
            };

            console.log('📤 Отправка регистрации:', { email: payload.email });

            const result = await authAPI.register(payload);

            console.log('📥 Ответ сервера:', result);

            if (result && result.success === true) {
                setTempEmail(formData.email);
                setVerificationStep(true);

                if (result.verificationCode) {
                    alert(`⚡ ТЕСТОВЫЙ РЕЖИМ: Ваш код подтверждения: ${result.verificationCode}`);
                }
            } else {
                throw new Error(result?.error || 'Ошибка регистрации');
            }

        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            setErrors({ general: error.message || 'Ошибка регистрации' });
        } finally {
            setIsLoading(false);
        }
    };

    // ПОДТВЕРЖДЕНИЕ КОДА (регистрация)
    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setErrors({ verification: 'Введите 6-значный код' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await authAPI.verify({
                email: tempEmail,
                code: verificationCode
            });

            if (result && result.success === true) {
                alert('✅ Аккаунт успешно подтверждён! Теперь войдите.');
                setVerificationStep(false);
                setIsLogin(true);
                setFormData({
                    email: tempEmail,
                    password: '',
                    confirmPassword: '',
                    rememberMe: false
                });
                setVerificationCode('');
            } else {
                throw new Error(result?.error || 'Ошибка подтверждения');
            }
        } catch (error) {
            console.error('❌ Ошибка подтверждения:', error);
            setErrors({ verification: error.message || 'Ошибка подтверждения' });
        } finally {
            setIsLoading(false);
        }
    };

    // ВОССТАНОВЛЕНИЕ ПАРОЛЯ - отправка кода
    const handleForgotPassword = async () => {
        if (!formData.email) {
            setErrors({ email: 'Введите email' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await authAPI.sendVerificationCode({ email: formData.email });

            if (result && result.success === true) {
                setTempEmail(formData.email);
                setResetCodeStep(true);
                alert('Код подтверждения отправлен на ваш email');
            } else {
                throw new Error(result?.error || 'Ошибка отправки кода');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            setErrors({ general: error.message || 'Ошибка отправки кода' });
        } finally {
            setIsLoading(false);
        }
    };

    // ВОССТАНОВЛЕНИЕ ПАРОЛЯ - сброс с кодом
    const handleResetPassword = async () => {
        if (!resetCode || resetCode.length !== 6) {
            setErrors({ resetCode: 'Введите 6-значный код' });
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setErrors({ newPassword: 'Пароль должен быть не менее 6 символов' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setErrors({ confirmNewPassword: 'Пароли не совпадают' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await authAPI.resetPassword({
                email: tempEmail,
                code: resetCode,
                newPassword: newPassword
            });

            if (result && result.success === true) {
                alert('✅ Пароль успешно изменён! Теперь войдите.');
                setForgotPasswordStep(false);
                setResetCodeStep(false);
                setIsLogin(true);
                setFormData({
                    email: tempEmail,
                    password: '',
                    confirmPassword: '',
                    rememberMe: false
                });
                setResetCode('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                throw new Error(result?.error || 'Ошибка сброса пароля');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            setErrors({ general: error.message || 'Ошибка сброса пароля' });
        } finally {
            setIsLoading(false);
        }
    };

    // ВХОД
    const handleLogin = async () => {
        if (!validateForm()) return;

        const result = await login(formData.email, formData.password);

        if (result.success) {
            const user = {
                email: localStorage.getItem('userEmail'),
                role: localStorage.getItem('userRole'),
                userType: localStorage.getItem('userType'),
                id: localStorage.getItem('userId')
            };
            
            console.log('✅ Передаем пользователя в onSuccess:', user);
            
            if (onSuccess) {
                onSuccess(user);
            }
            
            onClose();
        } else {
            setErrors({ login: result.error || 'Ошибка входа' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (forgotPasswordStep && !resetCodeStep) {
            await handleForgotPassword();
        } else if (resetCodeStep) {
            await handleResetPassword();
        } else if (isLogin) {
            await handleLogin();
        } else if (!verificationStep) {
            if (validateForm()) await handleRegister();
        }
    };

    if (!isOpen) return null;

    // Шаг восстановления пароля (ввод email)
    if (forgotPasswordStep && !resetCodeStep) {
        return (
            <div className="auth-modal-overlay" onClick={onClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={onClose}>✕</button>
                    <div className="auth-modal-header">
                        <div className="auth-modal-logo">
                            <span className="logo-icon">🏛️</span>
                            <Typography variant="h3" color="dark" weight="bold">M&Y</Typography>
                        </div>
                        <Typography variant="body" color="primary">Восстановление пароля</Typography>
                        <Typography variant="small" color="primary">Введите email для сброса пароля</Typography>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><Icons.Email size={16} color="#3a5a6a" /> Email</label>
                            <div className="input-wrapper">
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="example@mail.ru" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className={errors.email ? 'error' : ''} 
                                />
                            </div>
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        {errors.general && <span className="error-text">{errors.general}</span>}
                        <MyButton type="submit" variant="primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Отправка...' : 'Отправить код'}
                        </MyButton>
                        <div className="auth-modal-footer">
                            <button type="button" onClick={() => { setForgotPasswordStep(false); setErrors({}); }} className="link-btn">
                                ← Вернуться ко входу
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Шаг восстановления пароля (ввод кода и нового пароля)
    if (resetCodeStep) {
        return (
            <div className="auth-modal-overlay" onClick={onClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={onClose}>✕</button>
                    <div className="auth-modal-header">
                        <div className="auth-modal-logo">
                            <span className="logo-icon">🏛️</span>
                            <Typography variant="h3" color="dark" weight="bold">M&Y</Typography>
                        </div>
                        <Typography variant="body" color="primary">Сброс пароля</Typography>
                        <Typography variant="small" color="primary">Код отправлен на {tempEmail}</Typography>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Код подтверждения</label>
                            <input
                                type="text"
                                placeholder="Введите 6-значный код"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                maxLength={6}
                                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                            />
                            {errors.resetCode && <span className="error-text">{errors.resetCode}</span>}
                        </div>
                        <div className="form-group">
                            <label>Новый пароль</label>
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Новый пароль (мин. 6 символов)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                        </div>
                        <div className="form-group">
                            <label>Подтверждение пароля</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="Повторите пароль"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                            </div>
                            {errors.confirmNewPassword && <span className="error-text">{errors.confirmNewPassword}</span>}
                        </div>
                        {errors.general && <span className="error-text">{errors.general}</span>}
                        <MyButton type="submit" variant="primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Сброс...' : 'Сбросить пароль'}
                        </MyButton>
                        <div className="auth-modal-footer">
                            <button type="button" onClick={() => { setResetCodeStep(false); setForgotPasswordStep(true); }} className="link-btn">
                                ← Назад
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Шаг подтверждения регистрации
    if (verificationStep) {
        return (
            <div className="auth-modal-overlay" onClick={onClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={onClose}>✕</button>
                    <div className="auth-modal-header">
                        <div className="auth-modal-logo">
                            <span className="logo-icon">🏛️</span>
                            <Typography variant="h3" color="dark" weight="bold">M&Y</Typography>
                        </div>
                        <Typography variant="body" color="primary">Подтверждение аккаунта</Typography>
                        <Typography variant="small" color="primary">Код отправлен на {tempEmail}</Typography>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                        <div className="form-group">
                            <label>Код подтверждения</label>
                            <input
                                type="text"
                                placeholder="Введите 6-значный код"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                maxLength={6}
                                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                            />
                        </div>
                        {errors.verification && <span className="error-text">{errors.verification}</span>}
                        <MyButton type="submit" variant="primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Подтверждение...' : 'Подтвердить'}
                        </MyButton>
                        <div className="auth-modal-footer">
                            <button type="button" onClick={() => { setVerificationStep(false); setVerificationCode(''); }} className="link-btn">
                                Назад
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Основная форма (вход/регистрация)
    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>
                    <Icons.Close size={24} color="#9fb2bd" />
                </button>
                <div className="auth-modal-header">
                    <div className="auth-modal-logo">
                        <span className="logo-icon">🏛️</span>
                        <Typography variant="h3" color="dark" weight="bold">M&Y</Typography>
                    </div>
                    <Typography variant="body" color="primary" className="auth-modal-subtitle">
                        {isLogin ? 'Добро пожаловать!' : 'Создайте аккаунт'}
                    </Typography>
                </div>
                <div className="auth-modal-tabs">
                    <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); resetForm(); }}>
                        Вход
                    </button>
                    <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); resetForm(); }}>
                        Регистрация
                    </button>
                </div>
                <form className="auth-modal-form" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="form-group">
                        <label><Icons.Email size={16} color="#3a5a6a" /> Email</label>
                        <div className="input-wrapper">
                            <input type="email" name="email" placeholder="example@mail.ru" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
                        </div>
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Пароль (только для входа и регистрации) */}
                    {!forgotPasswordStep && (
                        <div className="form-group">
                            <label><Icons.Lock size={16} color="#3a5a6a" /> Пароль</label>
                            <div className="input-wrapper password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Введите пароль (мин. 6 символов)" value={formData.password} onChange={handleChange} className={errors.password ? 'error' : ''} />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                    )}

                    {/* Подтверждение пароля (только для регистрации) */}
                    {!isLogin && !verificationStep && !forgotPasswordStep && (
                        <div className="form-group">
                            <label><Icons.Lock size={16} color="#3a5a6a" /> Подтверждение пароля</label>
                            <div className="input-wrapper">
                                <input type="password" name="confirmPassword" placeholder="Повторите пароль" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} />
                            </div>
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>
                    )}

                    {/* Забыли пароль? (только для входа) */}
                    {isLogin && (
                        <div className="form-options">
                            <button 
                                type="button" 
                                className="forgot-password-link"
                                onClick={() => {
                                    setForgotPasswordStep(true);
                                    setErrors({});
                                }}
                            >
                                Забыли пароль?
                            </button>
                        </div>
                    )}

                    {/*errors.login && <span className="error-text" style={{ display: 'block', textAlign: 'center' }}>{errors.login}</span>}
                    {errors.general && <span className="error-text" style={{ display: 'block', textAlign: 'center' }}>{errors.general}</span>*/}
{errors.login && <span className="error-text">{typeof errors.login === 'string' ? errors.login : JSON.stringify(errors.login)}</span>}
{errors.general && <span className="error-text">{typeof errors.general === 'string' ? errors.general : errors.general?.message || 'Произошла ошибка'}</span>}
                    <MyButton type="submit" variant="primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }} disabled={isLoading}>
                        {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </MyButton>

                    <div className="auth-modal-footer">
                        {isLogin ? (
                            <Typography variant="small" color="primary">
                                Нет аккаунта? <button type="button" onClick={() => setIsLogin(false)} className="link-btn">Зарегистрироваться</button>
                            </Typography>
                        ) : (
                            <Typography variant="small" color="primary">
                                Уже есть аккаунт? <button type="button" onClick={() => setIsLogin(true)} className="link-btn">Войти</button>
                            </Typography>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
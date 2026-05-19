// src/components/Auth/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton';
import Icons from '../../UI/Icons/Icons';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth.js';
import { useModal } from '../../../hooks/useModal.js';

const AuthModal = ({ isOpen, onClose, onSuccess, defaultMode = 'login' }) => {
    const { login, isLoading: authLoading } = useAuth();
    const { showAlert, AlertModalComponent } = useModal();
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const navigate = useNavigate();
    const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
    const [resetPasswordEmail, setResetPasswordEmail] = useState('');
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
    
    // Капча
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaId, setCaptchaId] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    // Функция загрузки капчи
    const loadCaptcha = async () => {
        try {
            const response = await fetch('/api/auth/captcha');
            const data = await response.json();
            setCaptchaCode(data.captcha);
            setCaptchaId(data.captchaId);
            setCaptchaInput('');
        } catch (error) {
            console.error('Ошибка загрузки капчи:', error);
        }
    };

    // При открытии модалки в режиме регистрации загружаем капчу
    useEffect(() => {
        if (isOpen && !isLogin) {
            loadCaptcha();
        }
    }, [isOpen, isLogin]);

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
        setForgotPasswordStep(false);
        setResetPasswordEmail('');
        setNewPassword('');
        setConfirmNewPassword('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            rememberMe: false
        });
        setCaptchaInput('');
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

        if (!isLogin && !forgotPasswordStep) {
            if (!formData.password) {
                newErrors.password = 'Введите пароль';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Пароль должен содержать минимум 6 символов';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Пароли не совпадают';
            }

            // Проверка капчи
            if (!captchaInput || captchaInput !== captchaCode) {
                newErrors.captcha = 'Неверный код проверки';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // РЕГИСТРАЦИЯ
    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                captcha: captchaInput,
                captchaId: captchaId
            };

            console.log('📤 Отправка регистрации:', { email: payload.email, captcha: payload.captcha });

            const result = await authAPI.register(payload);

            console.log('📥 Ответ сервера:', result);

            if (result && result.success === true) {
                showAlert('✅ Регистрация успешна! Теперь вы можете войти.', 'Успех');
                setIsLogin(true);
                setFormData({
                    email: formData.email,
                    password: '',
                    confirmPassword: '',
                    rememberMe: false
                });
                setCaptchaInput('');
            } else {
                throw new Error(result?.error || 'Ошибка регистрации');
            }

        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            showAlert(error.message || 'Ошибка регистрации', 'Ошибка');
        } finally {
            setIsLoading(false);
            loadCaptcha();
        }
    };

    // СБРОС ПАРОЛЯ
    const handleResetPassword = async () => {
        if (!resetPasswordEmail) {
            setErrors({ resetEmail: 'Введите email' });
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
                email: resetPasswordEmail,
                newPassword: newPassword
            });

            if (result && result.success === true) {
                showAlert('✅ Пароль успешно изменён! Теперь войдите.', 'Успех');
                setForgotPasswordStep(false);
                setIsLogin(true);
                setResetPasswordEmail('');
                setNewPassword('');
                setConfirmNewPassword('');
                setFormData({
                    email: resetPasswordEmail,
                    password: '',
                    confirmPassword: '',
                    rememberMe: false
                });
            } else {
                throw new Error(result?.error || 'Ошибка сброса пароля');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            showAlert(error.message || 'Ошибка сброса пароля', 'Ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    // ВХОД
    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            setErrors({ login: 'Введите email и пароль' });
            return;
        }

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
            showAlert(result.error || 'Ошибка входа. Проверьте email и пароль.', 'Ошибка');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (forgotPasswordStep) {
            await handleResetPassword();
        } else if (isLogin) {
            await handleLogin();
        } else {
            await handleRegister();
        }
    };

    if (!isOpen) return null;

    // Шаг восстановления пароля
    // Шаг восстановления пароля
if (forgotPasswordStep) {
    return (
        <>
            <div className="auth-modal-overlay" onClick={onClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={onClose}>
                        <Icons.Close size={24} color="#9fb2bd" />
                    </button>
                    <div className="auth-modal-header">
                        <div className="auth-modal-logo">
                            <Icons.Building size={28} color="#3a5a6a" />
                            <Typography variant="h3" color="dark" weight="bold">M&Y</Typography>
                        </div>
                        <Typography variant="body" color="primary">Сброс пароля</Typography>
                        <Typography variant="small" color="primary">Введите email и новый пароль</Typography>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><Icons.Email size={16} color="#3a5a6a" /> Email</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="example@mail.ru"
                                    value={resetPasswordEmail}
                                    onChange={(e) => setResetPasswordEmail(e.target.value)}
                                    className={errors.resetEmail ? 'error' : ''}
                                />
                            </div>
                            {errors.resetEmail && <span className="error-text">{errors.resetEmail}</span>}
                        </div>
                        <div className="form-group">
                            <label><Icons.Lock size={16} color="#3a5a6a" /> Новый пароль</label>
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Новый пароль (мин. 6 символов)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <Icons.Eye size={16} /> : <Icons.Eye size={16} />}
                                </button>
                            </div>
                            {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                        </div>
                        <div className="form-group">
                            <label><Icons.Lock size={16} color="#3a5a6a" /> Подтверждение пароля</label>
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Повторите пароль"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <Icons.Eye size={16} /> : <Icons.Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmNewPassword && <span className="error-text">{errors.confirmNewPassword}</span>}
                        </div>
                        <MyButton type="submit" variant="primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                        </MyButton>
                        <div className="auth-modal-footer">
                            <button type="button" onClick={() => { setForgotPasswordStep(false); setErrors({}); }} className="link-btn">
                                ← Вернуться ко входу
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <AlertModalComponent />
        </>
    );
}
    // Основная форма (вход/регистрация)
    return (
        <>
            <div className="auth-modal-overlay" onClick={onClose}>
                <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button className="auth-modal-close" onClick={onClose}>
                        <Icons.Close size={24} color="#9fb2bd" />
                    </button>
                    <div className="auth-modal-header">
                        <div className="auth-modal-logo">
                            <Icons.Building size={28} color="#3a5a6a" />
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

                        {/* Пароль */}
                  {/* Пароль */}
<div className="form-group">
    <label><Icons.Lock size={16} color="#3a5a6a" /> Пароль</label>
    <div className="input-wrapper password-wrapper">
        <input 
            type={showPassword ? 'text' : 'password'} 
            name="password" 
            placeholder="Введите пароль (мин. 6 символов)" 
            value={formData.password} 
            onChange={handleChange} 
            className={errors.password ? 'error' : ''} 
        />
        <button 
            type="button" 
            className="password-toggle" 
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
            {showPassword ? <Icons.Eye size={16} /> : <Icons.Eye size={16} />}
        </button>
    </div>
    {errors.password && <span className="error-text">{errors.password}</span>}
</div>

{/* Подтверждение пароля (только для регистрации) */}
{!isLogin && (
    <div className="form-group">
        <label><Icons.Lock size={16} color="#3a5a6a" /> Подтверждение пароля</label>
        <div className="input-wrapper password-wrapper">
            <input 
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                placeholder="Повторите пароль" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className={errors.confirmPassword ? 'error' : ''} 
            />
            <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                {showPassword ? <Icons.Eye size={16} /> : <Icons.Eye size={16} />}
            </button>
        </div>
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
    </div>
)}

                        {/* Капча (только для регистрации) */}
                        {!isLogin && (
                            <div className="form-group">
                                <label><Icons.Lock size={16} color="#3a5a6a" /> Проверка "Я не робот"</label>
                                <div className="captcha-wrapper">
                                    <div className="captcha-display" style={{
                                        background: '#f0f0f0',
                                        padding: '12px',
                                        textAlign: 'center',
                                        fontSize: '24px',
                                        letterSpacing: '8px',
                                        fontFamily: 'monospace',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        userSelect: 'none'
                                    }}>
                                        {captchaCode}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={loadCaptcha}
                                        style={{ marginBottom: '10px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Icons.Calendar size={14} /> Обновить код
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Введите код с картинки"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        maxLength="6"
                                        style={{ textAlign: 'center', letterSpacing: '4px', width: '100%' }}
                                    />
                                </div>
                                {errors.captcha && <span className="error-text">{errors.captcha}</span>}
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
                                    <Icons.Link size={14} /> Забыли пароль?
                                </button>
                            </div>
                        )}

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
            <AlertModalComponent />
        </>
    );
};

export default AuthModal;
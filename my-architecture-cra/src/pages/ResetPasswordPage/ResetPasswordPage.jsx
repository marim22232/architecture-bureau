// my-architecture-cra/src/pages/ResetPasswordPage/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import MyButton from '../../components/UI/MyButton/MyButton';
import MyInput from '../../components/UI/MyInput/MyInput';
import Typography from '../../components/UI/Typography/Typography';
import Icons from '../../components/UI/Icons/Icons';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');
    const code = searchParams.get('code');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Если нет email или code, перенаправляем на главную через 3 секунды
        if (!email || !code) {
            const timer = setTimeout(() => navigate('/'), 3000);
            return () => clearTimeout(timer);
        }
    }, [email, code, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const result = await authAPI.resetPassword({
                email,
                code,
                newPassword
            });
            
            if (result.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError(result.error || 'Ошибка сброса пароля');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    // Неверная ссылка
    if (!email || !code) {
        return (
            <div className="reset-password-page">
                <div className="reset-card">
                    <div className="reset-icon error">
                        <Icons.Close size={48} color="#C62828" />
                    </div>
                    <Typography variant="h3" color="dark" weight="bold" align="center">
                        Неверная ссылка
                    </Typography>
                    <Typography variant="body" color="primary" align="center">
                        Ссылка для сброса пароля недействительна или устарела.
                    </Typography>
                    <MyButton onClick={() => navigate('/')} variant="primary">
                        На главную
                    </MyButton>
                </div>
            </div>
        );
    }

    // Успешная установка пароля
    if (success) {
        return (
            <div className="reset-password-page">
                <div className="reset-card">
                    <div className="reset-icon success">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <Typography variant="h3" color="dark" weight="bold" align="center">
                        Пароль успешно установлен!
                    </Typography>
                    <Typography variant="body" color="primary" align="center">
                        Теперь вы можете войти в свой аккаунт.
                    </Typography>
                    <MyButton onClick={() => navigate('/')} variant="primary">
                        На главную
                    </MyButton>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <div className="reset-card">
                <div className="reset-header">
                    <div className="reset-logo">
                        <span className="logo-icon">🏛️</span>
                        <Typography variant="h3" color="dark" weight="bold">M&Y</Typography>
                    </div>
                    <Typography variant="body" color="primary" align="center">
                        Установка нового пароля
                    </Typography>
                    <Typography variant="small" color="primary" align="center">
                        для аккаунта: {email}
                    </Typography>
                </div>

                <form className="reset-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <Icons.Lock size={16} color="#4B6473" />
                            Новый пароль
                        </label>
                        <div className="input-wrapper password-wrapper">
                            <MyInput
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Не менее 6 символов"
                                required
                                style={{ paddingRight: '45px' }}
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <Icons.Lock size={16} color="#4B6473" />
                            Подтверждение пароля
                        </label>
                        <div className="input-wrapper password-wrapper">
                            <MyInput
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите пароль"
                                required
                                style={{ paddingRight: '45px' }}
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <Icons.Close size={16} color="#C62828" />
                            <Typography variant="small" color="error">{error}</Typography>
                        </div>
                    )}

                    <MyButton 
                        type="submit" 
                        variant="primary" 
                        style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : 'Установить пароль'}
                    </MyButton>

                    <div className="reset-footer">
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="link-btn"
                        >
                            ← Вернуться на главную
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
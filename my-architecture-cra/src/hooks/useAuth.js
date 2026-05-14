// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';

export const useAuth = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // Проверка авторизации при загрузке
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userType = localStorage.getItem('userType');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');

        if (token && userRole) {
            setUser({
                id: userId,
                role: userRole,
                userType: userType,
                email: userEmail,
                isAuthenticated: true
            });
        }
    }, []);

    // Логин
    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authAPI.login({ email, password });

            if (result && result.success) {
                // Сохраняем данные в localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('userRole', result.user?.role || 'user');
                localStorage.setItem('userType', result.user?.userType || 'user');
                localStorage.setItem('userId', result.user?.id);
                localStorage.setItem('userEmail', email);

                // Обновляем состояние
                setUser({
                    id: result.user?.id,
                    role: result.user?.role,
                    userType: result.user?.userType,
                    email: email,
                    isAuthenticated: true
                });

                // Редирект на главную
                navigate('/', { replace: true });

                return { success: true };
            } else {
                const errorMsg = result?.error || 'Ошибка входа';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            const errorMsg = error.message || 'Ошибка соединения';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Выход
    const logout = () => {
        // Очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('rememberMe');

        // Обновляем состояние
        setUser(null);

        // Редирект на главную
        navigate('/', { replace: true });
    };

    // Обновление пользователя (после изменения профиля)
    const updateUser = (updatedData) => {
        setUser(prev => ({
            ...prev,
            ...updatedData
        }));

        if (updatedData.email) {
            localStorage.setItem('userEmail', updatedData.email);
        }
    };

    // Проверка, является ли пользователь админом
    // useAuth.js
    const isAdmin = () => {
        // Сначала проверяем user из состояния
        if (user?.role === 'admin') return true;
        // Если нет, проверяем localStorage напрямую
        const role = localStorage.getItem('userRole');
        return role === 'admin';
    };

    // Проверка, авторизован ли пользователь
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    // Получение текущего пользователя с сервера
    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const result = await authAPI.getCurrentUser();
            if (result && result.success) {
                setUser(prev => ({
                    ...prev,
                    ...result.user,
                    isAuthenticated: true
                }));
                return result.user;
            }
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
        }
        return null;
    };

    return {
        login,
        logout,
        updateUser,
        fetchCurrentUser,
        isAdmin,
        isAuthenticated,
        user,
        isLoading,
        error
    };
};
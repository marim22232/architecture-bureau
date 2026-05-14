// src/components/UI/PrivateRoute/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
    // ⭐ ВАЖНО: читаем из localStorage ПРЯМО здесь, без кэширования
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🔒 PrivateRoute check:', { 
        token: token ? 'есть' : 'нет', 
        userRole: userRole,
        adminOnly: adminOnly,
        condition: adminOnly && userRole !== 'admin'
    });
    
    // Проверяем авторизацию
    if (!token) {
        console.log('❌ Нет токена → /login');
        return <Navigate to="/login" replace />;
    }
    
    // Проверяем права админа (сравниваем со строкой 'admin')
    if (adminOnly && userRole !== 'admin') {
        console.log(`❌ Нужен admin, а у вас "${userRole}" → /`);
        return <Navigate to="/" replace />;
    }
    
    console.log('✅ Доступ разрешен');
    return children;
};

export default PrivateRoute;
import React, { useState, useEffect } from 'react';
import ServicesSlider from '../components/ServicesSlider/ServicesSlider.jsx';
import Typography from '../components/UI/Typography/Typography.jsx';

const ServicesAdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Проверка роли пользователя
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (token && (user.role === 'admin' || user.role === 'administrator')) {
      setIsAdmin(true);
      setUserRole(user.role);
    }
    
    // Если нужно проверить через API
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.role === 'admin' || userData.role === 'administrator') {
          setIsAdmin(true);
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки роли:', error);
    }
  };

  return (
    <div className="services-page">
      <div className="services-header">
        <Typography variant="h2" weight="bold" align="center">
          Наши возможности
        </Typography>
        
        {isAdmin && (
          <div className="admin-badge">
            <span className="admin-icon">👑</span>
            <Typography variant="small" color="primary">
              Режим администратора - вы можете редактировать и добавлять услуги
            </Typography>
          </div>
        )}
      </div>
      
      <ServicesSlider isAdmin={isAdmin} />
    </div>
  );
};

export default ServicesAdminPage;
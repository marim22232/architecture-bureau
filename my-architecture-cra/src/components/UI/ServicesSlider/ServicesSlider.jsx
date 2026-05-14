import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './ServicesSlider.css';
import Typography from '../../UI/Typography/Typography.jsx';
import { getServicesByCategorySlug } from '../../../services/api';
import ServiceEditModal from './ServiceEditModal.jsx';
import AddServiceModal from './AddServiceModal.jsx';

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// Получаем роль из localStorage (более надёжно)
  const getUserRole = () => localStorage.getItem('userRole');
  const isAdminUser = getUserRole() === 'admin';
  const isManager = getUserRole() === 'manager';
  const isStaff = isAdminUser || isManager;
const ServicesSlider = ({ isAdmin = false, onServicesUpdate }) => {
  const [services, setServices] = useState({
    architecture: [],
    interior: [],
    loading: true,
    error: null
  });

  const [activeCategory, setActiveCategory] = useState('architecture');
  const [editingService, setEditingService] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const categories = [
    { id: 'architecture', name: 'Архитектурные услуги', icon: '🏛️', slug: 'architecture' },
    { id: 'interior', name: 'Дизайн интерьера', icon: '🪑', slug: 'interior' },
  ];

  const fetchAllServices = async () => {
    setServices(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [architectureRes, interiorRes] = await Promise.all([
        getServicesByCategorySlug('architecture'),
        getServicesByCategorySlug('interior')
      ]);

      const architectureData = Array.isArray(architectureRes) 
        ? architectureRes 
        : architectureRes.services || [];
      
      const interiorData = Array.isArray(interiorRes) 
        ? interiorRes 
        : interiorRes.services || [];

      const newServices = {
        architecture: architectureData,
        interior: interiorData,
        loading: false,
        error: null
      };

      setServices(newServices);
      
      if (onServicesUpdate) {
        onServicesUpdate(newServices);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      setServices(prev => ({
        ...prev,
        loading: false,
        error: 'Не удалось загрузить услуги'
      }));
    }
  };

  useEffect(() => {
    fetchAllServices();
  }, [refreshTrigger]);

  const currentServices = services[activeCategory] || [];

  const handleEditClick = (service) => {
    setEditingService(service);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const refreshServices = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSaveService = async (updatedService) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/services/${updatedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedService)
      });

      if (response.ok) {
        refreshServices();
        setIsEditModalOpen(false);
        setEditingService(null);
      } else {
        const error = await response.json();
        console.error('Ошибка при сохранении:', error);
        alert('Ошибка при сохранении услуги');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при сохранении услуги');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          refreshServices();
          setIsEditModalOpen(false);
          setEditingService(null);
        } else {
          console.error('Ошибка при удалении');
          alert('Ошибка при удалении услуги');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении услуги');
      }
    }
  };

  const handleCreateService = async (newService) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newService)
      });

      if (response.ok) {
        refreshServices();
        setIsAddModalOpen(false);
        alert('Услуга успешно добавлена');
      } else {
        const error = await response.json();
        console.error('Ошибка при создании:', error);
        alert('Ошибка при создании услуги');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании услуги');
    }
  };

  if (services.loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (services.error) {
    return (
      <div className="services-error">
        <Typography variant="body" color="primary">{services.error}</Typography>
        <button onClick={fetchAllServices} className="retry-btn">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="services-slider-container">
        {/* Кнопки категорий */}
        <div className="services-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
          
          {/* Кнопка добавления услуги (только для админа) */}
          {isAdminUser && (
            <button className="category-btn add-service-btn" onClick={handleAddClick}>
              <span className="category-icon">➕</span>
              <span className="category-name">Добавить услугу</span>
            </button>
          )}
        </div>

        {/* Слайдер услуг */}
        {currentServices.length > 0 ? (
          <div className="services-slider-wrapper">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
                1200: { slidesPerView: 4 }
              }}
              className="services-swiper"
            >
              {currentServices.map((service) => {
                let imageSrc = null;
                
                if (service.icon_path) {
                  imageSrc = `http://localhost:5000${service.icon_path}`;
                } else if (service.icon && !service.icon.match(/^[🏛️🪑📦🎨💰📋🛒👨‍💻👩‍🎨⚡📄🏗️🌟🏆📈🏅🎨💚]/)) {
                  imageSrc = `http://localhost:5000/${service.icon}`;
                }
                
                return (
                  <SwiperSlide key={service.id}>
                    <div className="service-card">
                      {isAdminUser && (
                        <div className="service-admin-actions">
                          <button 
                            className="admin-edit-btn"
                            onClick={() => handleEditClick(service)}
                            title="Редактировать услугу"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      <div className="service-image">
                        {imageSrc ? (
                          <img 
                            src={imageSrc}
                            alt={service.title}
                            className="service-img"
                            onError={(e) => {
                              console.error('Ошибка загрузки изображения:', imageSrc);
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="service-fallback">📦</span>';
                            }}
                          />
                        ) : (
                          <span className="service-fallback">{service.icon || '📦'}</span>
                        )}
                      </div>
                      <Typography variant="h4" color="dark" weight="bold" className="service-title">
                        {service.title}
                      </Typography>
                      <Typography variant="small" color="primary" className="service-description">
                        {service.description}
                      </Typography>
                      {service.price_range && (
                        <div className="service-price">
                          <Typography variant="small" color="accent" weight="bold">
                            {service.price_range}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : (
          <div className="no-services">
            <Typography variant="body" color="primary">
              {isAdminUser ? 'Нажмите "Добавить услугу" чтобы создать первую услугу' : 'Услуги в этой категории временно недоступны'}
            </Typography>
            {isAdminUser && (
              <button onClick={handleAddClick} className="add-first-btn">
                Добавить первую услугу
              </button>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      <ServiceEditModal
        isOpen={isEditModalOpen}
        service={editingService}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
      />

      {/* Модальное окно добавления */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateService}
        categories={categories}
      />
    </>
  );
};

export default ServicesSlider;
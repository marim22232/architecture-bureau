import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './ServicesSlider.css';
import Typography from '../../UI/Typography/Typography.jsx';
import { getServicesByCategorySlug } from '../../../services/api';
import ServiceEditModal from './ServiceEditModal.jsx';
import AddServiceModal from './AddServiceModal.jsx';
import { useModal } from '../../../hooks/useModal'; // ✅ Добавить импорт
import Icons from '../../UI/Icons/Icons.jsx'; // ✅ Добавить импорт иконок
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const getUserRole = () => localStorage.getItem('userRole');
const isAdminUser = getUserRole() === 'admin';

// Базовый URL для API
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const ServicesSlider = ({ isAdmin = false, onServicesUpdate }) => {
  const { showConfirm, showAlert, ConfirmModalComponent, AlertModalComponent } = useModal(); // ✅ Добавить
  
  const [services, setServices] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [serviceToDelete, setServiceToDelete] = useState(null); // ✅ Для confirm модалки

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services/categories', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : {}
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].slug);
        }
      } else {
        console.error('Ошибка загрузки категорий:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const fetchAllServices = async () => {
    if (categories.length === 0) return;
    
    setLoading(true);
    
    try {
      const promises = categories.map(cat => 
        getServicesByCategorySlug(cat.slug)
      );
      
      const results = await Promise.all(promises);
      
      const servicesByCategory = {};
      categories.forEach((cat, index) => {
        const data = Array.isArray(results[index]) 
          ? results[index] 
          : results[index]?.services || [];
        servicesByCategory[cat.slug] = data;
      });
      
      setServices(servicesByCategory);
      
      if (onServicesUpdate) {
        onServicesUpdate(servicesByCategory);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      showAlert('Ошибка при загрузке услуг', 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchAllServices();
    }
  }, [categories, refreshTrigger]);

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
      const response = await fetch(`/api/services/${updatedService.id}`, {
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
        showAlert('Услуга успешно обновлена');
      } else {
        const error = await response.json();
        console.error('Ошибка при сохранении:', error);
        showAlert('Ошибка при сохранении услуги', 'Ошибка');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при сохранении услуги', 'Ошибка');
    }
  };

  const handleDeleteService = async (serviceId) => {
    setServiceToDelete(serviceId);
  };

  const confirmDelete = async () => {
    const serviceId = serviceToDelete;
    setServiceToDelete(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        refreshServices();
        setIsEditModalOpen(false);
        setEditingService(null);
        showAlert('Услуга удалена');
      } else {
        console.error('Ошибка при удалении');
        showAlert('Ошибка при удалении услуги', 'Ошибка');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при удалении услуги', 'Ошибка');
    }
  };

  const handleCreateService = async (newService) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
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
        showAlert('Услуга успешно добавлена');
      } else {
        const error = await response.json();
        console.error('Ошибка при создании:', error);
        showAlert('Ошибка при создании услуги', 'Ошибка');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при создании услуги', 'Ошибка');
    }
  };

  const getImageUrl = (service) => {
    // Жестко задаем правильный URL API
   const API_BASE_URL = 'https://my-architecture-api.onrender.com';
    
    const cleanPath = (path) => {
        if (!path) return null;
        let cleaned = path;
        if (cleaned.startsWith('/api/')) {
            cleaned = cleaned.replace('/api', '');
        }
        if (cleaned.includes('/api/uploads')) {
            cleaned = cleaned.replace('/api', '');
        }
        return cleaned;  // ❌ Может вернуть "uploads/..." без ведущего слэша
    };
    
    // Обработка icon_path
   if (service.icon_path) {
        let cleanedPath = cleanPath(service.icon_path);
        if (cleanedPath.startsWith('http')) {
            return cleanedPath;
        }
        // ❌ ПРОБЛЕМА ЗДЕСЬ:
        return `${API_BASE_URL}${cleanedPath}`;  
        // Если cleanedPath = "uploads/services/2.png"
        // Результат: "https://...onrender.comuploads/..." ❌
    }
    
    // Обработка icon (если это не эмодзи)
    if (service.icon && !service.icon.match(/^[🏛️🪑📦🎨💰📋🛒👨‍💻👩‍🎨⚡📄🏗️🌟🏆📈🏅🎨💚]/)) {
        let cleanedPath = cleanPath(service.icon);
        // Если уже полный URL, возвращаем как есть
        if (cleanedPath.startsWith('http')) {
            return cleanedPath;
        }
        // Иначе добавляем базовый URL
        return `${API_BASE_URL}${cleanedPath}`;
    }
    
    return null;
};

  const getCategoryIcon = (slug) => {
    const icons = {
      'architecture': '🏛️',
      'interior': '🪑'
    };
    return icons[slug] || '📁';
  };

  if (loading || categories.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="services-slider-container">
        <div className="services-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.slug ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.slug)}
            >
              <span className="category-icon">{getCategoryIcon(category.slug)}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
          
          {isAdminUser && (
            <button className="category-btn add-service-btn" onClick={handleAddClick}>
              <span className="category-icon">
                <Icons.Plus size={18} />
              </span>
              <span className="category-name">Добавить услугу</span>
            </button>
          )}
        </div>

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
                const imageUrl = getImageUrl(service);
                
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
                            <Icons.Edit size={16} />
                          </button>
                          <button 
                            className="admin-delete-btn"
                            onClick={() => handleDeleteService(service.id)}
                            title="Удалить услугу"
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      )}
                      <div className="service-image">
                        {imageUrl ? (
                          <img 
                            src={imageUrl}
                            alt={service.title}
                            className="service-img"
                            onError={(e) => {
                              console.error('Ошибка загрузки изображения:', imageUrl);
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
                   
{(service.price_per_sqm || service.price_fixed || service.price_range) && (
    <div className="service-price">
        <Typography variant="small" color="accent" weight="bold">
            {service.price_per_sqm 
                ? `от ${service.price_per_sqm} ₽/м²` 
                : service.price_fixed 
                    ? `${service.price_fixed} ₽` 
                    : service.price_range}
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
                <Icons.Plus size={16} /> Добавить первую услугу
              </button>
            )}
          </div>
        )}
      </div>

      <ServiceEditModal
        isOpen={isEditModalOpen}
        service={editingService}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        onDelete={() => setServiceToDelete(editingService?.id)}
      />

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateService}
        categories={categories}
      />

      {/* ✅ Кастомные модальные окна */}
      <ConfirmModalComponent />
      <AlertModalComponent />
      
      {/* ✅ Confirm модалка для удаления */}
      <ConfirmModal
        isOpen={serviceToDelete !== null}
        onClose={() => setServiceToDelete(null)}
        onConfirm={confirmDelete}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить."
      />
    </>
  );
};

export default ServicesSlider;
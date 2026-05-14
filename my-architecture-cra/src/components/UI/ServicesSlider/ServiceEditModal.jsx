import React, { useState, useEffect } from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import './ServiceEditModal.css';

const ServiceEditModal = ({ isOpen, service, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
    is_popular: false,
    icon: '',
    icon_path: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        price_range: service.price_range || '',
        is_popular: service.is_popular || false,
        icon: service.icon || '',
        icon_path: service.icon_path || ''
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let iconPath = formData.icon_path;
      
      // Если выбран новый файл, загружаем его
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('icon', selectedFile);
        
        const uploadResponse = await fetch('/api/services/upload-icon', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: uploadData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          iconPath = uploadResult.path;
        }
      }
      
      const updatedService = {
        ...formData,
        icon_path: iconPath
      };
      
      await onSave(updatedService);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Typography variant="h3" weight="bold">Редактирование услуги</Typography>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Название услуги</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Ценовой диапазон</label>
            <input
              type="text"
              name="price_range"
              value={formData.price_range}
              onChange={handleChange}
              placeholder="например: от 50 000 ₽"
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_popular"
                checked={formData.is_popular}
                onChange={handleChange}
              />
              Популярная услуга
            </label>
          </div>
          
          <div className="form-group">
            <label>Иконка (эмодзи или текст)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="🏛️ или название иконки"
            />
          </div>
          
          <div className="form-group">
            <label>Изображение</label>
            {formData.icon_path && (
              <div className="current-image">
                <img 
                  src={`http://localhost:5000${formData.icon_path}`} 
                  alt="Текущее изображение"
                  style={{ maxWidth: '100px', marginBottom: '10px' }}
                />
                <p>Текущее изображение</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <small>Оставьте пустым, чтобы сохранить текущее изображение</small>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-delete" onClick={() => onDelete(service.id)}>
              Удалить
            </button>
            <div className="modal-actions-right">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceEditModal;
import React, { useState, useEffect } from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import './ServiceEditModal.css';

const ServiceEditModal = ({ isOpen, service, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
    icon: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        price_range: service.price_range || '',
        icon: service.icon || '',
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Просто сохраняем formData без загрузки файлов
    await onSave(formData);
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
            <label>Иконка (эмодзи)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="🏛️"
              maxLength="2"
            />
          </div>
          
          <div className="form-group">
            <label>Изображение</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <small>Загрузите изображение для услуги (опционально)</small>
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
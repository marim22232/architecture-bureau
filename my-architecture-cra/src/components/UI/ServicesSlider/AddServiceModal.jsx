import React, { useState } from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import './ServiceEditModal.css';

const AddServiceModal = ({ isOpen, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
    is_popular: false,
    icon: '',
    category_id: null,
    category_slug: 'architecture'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      let iconPath = null;
      
      // Если выбран файл, загружаем его
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('icon', selectedFile);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch('http://localhost:5000/api/services/upload-icon', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          iconPath = uploadResult.path;
        }
      }
      
      const newService = {
        ...formData,
        icon_path: iconPath
      };
      
      await onSave(newService);
      // Сброс формы после успешного сохранения
      setFormData({
        title: '',
        description: '',
        price_range: '',
        is_popular: false,
        icon: '',
        category_id: null,
        category_slug: 'architecture'
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Ошибка при создании:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Typography variant="h3" weight="bold">Добавление новой услуги</Typography>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Категория *</label>
            <select
              name="category_slug"
              value={formData.category_slug}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Название услуги *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Например: Архитектурно-планировочная концепция"
            />
          </div>
          
          <div className="form-group">
            <label>Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              placeholder="Краткое описание услуги"
            />
          </div>
          
          <div className="form-group">
            <label>Ценовой диапазон</label>
            <input
              type="text"
              name="price_range"
              value={formData.price_range}
              onChange={handleChange}
              placeholder="например: от 50 000 ₽ или договорная"
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
              Отметить как популярную услугу
            </label>
          </div>
          
          <div className="form-group">
            <label>Иконка (эмодзи)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="🏛️ или 📐"
              maxLength="2"
            />
            <small>Можно использовать эмодзи: 🏛️ 🪑 📐 🎨 💰 и т.д.</small>
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
            <button type="button" className="btn-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать услугу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
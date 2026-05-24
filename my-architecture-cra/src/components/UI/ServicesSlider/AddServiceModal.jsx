// AddServiceModal.jsx
import React, { useState } from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import './ServiceEditModal.css';

const AddServiceModal = ({ isOpen, onClose, onSave, categories, showAlert  }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
    price_per_sqm: '',   // ✅ добавить
    price_fixed: '',     // ✅ добавить
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
        const selectedCategory = categories.find(cat => cat.slug === formData.category_slug);
        
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('price_range', formData.price_range || '');
        
        // ✅ ИСПРАВЛЕНИЕ: преобразуем пустые строки в null
        const pricePerSqm = formData.price_per_sqm === '' ? null : parseFloat(formData.price_per_sqm);
        const priceFixed = formData.price_fixed === '' ? null : parseFloat(formData.price_fixed);
        
        submitData.append('price_per_sqm', pricePerSqm !== null ? pricePerSqm : '');
        submitData.append('price_fixed', priceFixed !== null ? priceFixed : '');
        submitData.append('icon', formData.icon || '📦');
        submitData.append('category_id', selectedCategory?.id || '');
        
        if (selectedFile) {
            submitData.append('image', selectedFile);
        }
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/services', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: submitData
        });

        if (response.ok) {
            const newService = await response.json();
            await onSave(newService);
            
            setFormData({
                title: '',
                description: '',
                price_range: '',
                price_per_sqm: '',
                price_fixed: '',
                icon: '',
                category_id: null,
                category_slug: 'architecture'
            });
            setSelectedFile(null);
            onClose();
            showAlert('Услуга успешно добавлена');
        } else {
            const errorText = await response.text();
            console.error('Ошибка при создании:', errorText);
            showAlert('Ошибка при создании услуги', 'Ошибка');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showAlert('Ошибка при создании услуги', 'Ошибка');
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
            <label>Ценовой диапазон (текст)</label>
            <input
              type="text"
              name="price_range"
              value={formData.price_range}
              onChange={handleChange}
              placeholder="например: от 1500 ₽/м²"
            />
          </div>

          <div className="form-group">
            <label>Цена за м² (число)</label>
            <input
              type="number"
              name="price_per_sqm"
              value={formData.price_per_sqm}
              onChange={handleChange}
              placeholder="например: 1500"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Фиксированная цена (число)</label>
            <input
              type="number"
              name="price_fixed"
              value={formData.price_fixed}
              onChange={handleChange}
              placeholder="например: 50000"
              step="0.01"
            />
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
import React, { useState } from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import './ServiceEditModal.css';

const AddServiceModal = ({ isOpen, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
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
    // Находим выбранную категорию и получаем её ID
    const selectedCategory = categories.find(cat => cat.slug === formData.category_slug);
    
    // Подготавливаем данные с правильным category_id (число, а не строка!)
    const newService = {
      title: formData.title,
      description: formData.description,
      price_range: formData.price_range,
      icon: formData.icon,
      category_id: selectedCategory?.id || null  // ← должно быть число (1 или 2)
    };
    
    console.log('Отправляем данные:', newService); // Проверьте в консоли
    await onSave(newService);
    
    // Сброс формы
    setFormData({
      title: '',
      description: '',
      price_range: '', 
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
              value={formData.category_slug}  // ← было category_id, исправьте на category_slug
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
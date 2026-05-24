// ServiceEditModal.jsx
import React, { useState, useEffect } from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import './ServiceEditModal.css';

const ServiceEditModal = ({ isOpen, showAlert, service, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
    price_per_sqm: '',   // ✅ добавить
    price_fixed: '',     // ✅ добавить
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
        price_per_sqm: service.price_per_sqm || '',   // ✅ добавить
        price_fixed: service.price_fixed || '',       // ✅ добавить
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

  // В handleSubmit перед отправкой
  // В ServiceEditModal.jsx, измените handleSubmit
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Проверка ID
    if (!service || !service.id) {
        const errorMsg = 'ID услуги не найден. Невозможно сохранить изменения.';
        console.error('❌', errorMsg);
        if (showAlert) showAlert(errorMsg, 'Ошибка');
        onClose();
        return;
    }
    
    setIsLoading(true);

    try {
        // Подготовка данных
        const serviceData = {
            title: formData.title,
            description: formData.description,
            price_range: formData.price_range || null,
            price_per_sqm: formData.price_per_sqm === '' ? null : parseFloat(formData.price_per_sqm),
            price_fixed: formData.price_fixed === '' ? null : parseFloat(formData.price_fixed),
            icon: formData.icon || '📦',
            is_active: true
        };
        
        console.log('📤 Отправка обновления для ID:', service.id);
        console.log('📦 Данные:', serviceData);
        
        // Вызываем onSave, который использует API
        await onSave({
            id: service.id,
            ...serviceData
        });
        
        onClose();
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        if (showAlert) showAlert(error.message || 'Ошибка при сохранении услуги', 'Ошибка');
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
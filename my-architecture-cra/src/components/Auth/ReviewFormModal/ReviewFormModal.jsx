// src/components/Auth/ReviewFormModal/ReviewFormModal.jsx
import React, { useState, useEffect } from 'react';
import './ReviewFormModal.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton.jsx';

const ReviewFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    projects, 
    userInfo, 
    onSuccess,
    review = null,
    isEditing = false 
}) => {
    const [formData, setFormData] = useState({
        project_id: '',
        rating: 5,
        text: '',
        client_name: userInfo?.profile?.first_name 
            ? `${userInfo.profile.first_name} ${userInfo.profile.last_name || ''}`.trim() 
            : userInfo?.name || (userInfo?.email ? userInfo.email.split('@')[0] : ''),
        client_email: userInfo?.email || '',
        client_company: userInfo?.profile?.company_name || userInfo?.company || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        if (review && isEditing) {
            setFormData(prev => ({
                ...prev,
                project_id: review.project_id || '',
                rating: review.rating || 5,
                text: review.text || '',
                client_name: review.client_name || prev.client_name,
                client_company: review.client_company || prev.client_company
            }));
        }
    }, [review, isEditing]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEditing && !formData.project_id) {
            alert('Пожалуйста, выберите проект');
            return;
        }
        
        if (!formData.text.trim()) {
            alert('Пожалуйста, напишите отзыв');
            return;
        }
        
        if (formData.text.length < 10) {
            alert('Отзыв должен содержать не менее 10 символов');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const submitData = isEditing && review
                ? { id: review.id, text: formData.text, rating: formData.rating }
                : {
                    project_id: formData.project_id,
                    text: formData.text,
                    rating: formData.rating
                  };
            
            await onSubmit(submitData, isEditing);
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(isEditing ? 'Ошибка при обновлении отзыва' : 'Ошибка при отправке отзыва');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        const ratingToShow = hoveredRating || formData.rating;
        
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`modal-star ${i <= ratingToShow ? 'filled' : 'empty'}`}
                    onClick={() => handleRatingClick(i)}
                    onMouseEnter={() => setHoveredRating(i)}
                    onMouseLeave={() => setHoveredRating(0)}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const ratingLabels = {
        1: 'Ужасно',
        2: 'Плохо',
        3: 'Нормально',
        4: 'Хорошо',
        5: 'Отлично'
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <Typography variant="h3" weight="bold">
                        {isEditing ? 'Редактировать отзыв' : 'Оставить отзыв'}
                    </Typography>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    {!isEditing && (
                        <div className="form-group">
                            <Typography variant="body" weight="bold" as="label" className="form-label">
                                Выберите проект *
                            </Typography>
                            <select
                                name="project_id"
                                value={formData.project_id}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Выберите проект</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.title} - {project.project_year || new Date(project.created_at).getFullYear()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isEditing && review?.project_title && (
                        <div className="form-group">
                            <Typography variant="body" weight="bold" as="label" className="form-label">
                                Проект
                            </Typography>
                            <div className="form-static">
                                {review.project_title}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <Typography variant="body" weight="bold" as="label" className="form-label">
                            Оценка *
                        </Typography>
                        <div className="rating-container">
                            <div className="rating-stars">
                                {renderStars()}
                            </div>
                            <Typography variant="small" color="default" className="rating-label">
                                {ratingLabels[hoveredRating || formData.rating]}
                            </Typography>
                        </div>
                    </div>

                    <div className="form-group">
                        <Typography variant="body" weight="bold" as="label" className="form-label">
                            Ваш отзыв *
                        </Typography>
                        <textarea
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            className="form-textarea"
                            rows={5}
                            placeholder="Расскажите о своем опыте сотрудничества с нами..."
                            required
                        />
                        <Typography variant="small" color="default" className="form-hint">
                            Минимум 10 символов. {formData.text.length}/500
                        </Typography>
                    </div>

                    <div className="form-group">
                        <Typography variant="body" weight="bold" as="label" className="form-label">
                            Ваше имя
                        </Typography>
                        <input
                            type="text"
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleChange}
                            className="form-input"
                            readOnly
                            disabled
                        />
                        <Typography variant="small" color="default" className="form-hint">
                            Имя автоматически берется из вашего аккаунта
                        </Typography>
                    </div>

                    <div className="form-group">
                        <Typography variant="body" weight="bold" as="label" className="form-label">
                            Компания
                        </Typography>
                        <input
                            type="text"
                            name="client_company"
                            value={formData.client_company}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ваша компания (опционально)"
                        />
                    </div>

                    <div className="modal-footer">
                        <MyButton type="button" variant="secondary" onClick={onClose}>
                            Отмена
                        </MyButton>
                        <MyButton type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting 
                                ? (isEditing ? 'Сохранение...' : 'Отправка...') 
                                : (isEditing ? 'Сохранить изменения' : 'Отправить отзыв')}
                        </MyButton>
                    </div>
                    
                    <div className="form-notice">
                        <span>ℹ️</span>
                        <Typography variant="small" color="default" className="notice-text">
                            {isEditing 
                                ? 'После редактирования отзыв снова пройдет модерацию.'
                                : 'Отзыв будет опубликован после проверки модератором. Вы можете оставить только один отзыв на проект.'}
                        </Typography>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewFormModal;
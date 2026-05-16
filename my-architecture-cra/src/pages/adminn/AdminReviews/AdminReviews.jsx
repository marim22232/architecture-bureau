// src/pages/adminn/AdminReviews/AdminReviews.jsx
import React, { useState, useEffect } from 'react';
import './AdminReviews.css';
import Typography from '../../../components/UI/Typography/Typography.jsx';
import Loader from '../../../components/UI/Loader/Loader.jsx';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, pending: 0, published: 0 });
    
    // src/pages/adminn/AdminReviews/AdminReviews.jsx

const API_URL = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

// Загрузка всех отзывов (админ) - ИСПРАВЛЕНО
const loadReviews = async () => {
    setLoading(true);
    try {
        const token = getToken();
        // ✅ ИЗМЕНЕНО: /api/testimonials/admin/all (а не /api/admin/testimonials/all)
        const response = await fetch(`${API_URL}/testimonials/admin/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки');
        }
        
        const data = await response.json();
        const reviewsList = Array.isArray(data) ? data : data.testimonials || [];
        setReviews(reviewsList);
        
        setStats({
            total: reviewsList.length,
            pending: reviewsList.filter(r => !r.is_published).length,
            published: reviewsList.filter(r => r.is_published).length
        });
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        setReviews([]);
    } finally {
        setLoading(false);
    }
};

// Публикация/скрытие отзыва - ИСПРАВЛЕНО
const togglePublish = async (id, currentStatus) => {
    try {
        const token = getToken();
        // ✅ /api/testimonials/admin/:id/publish
        const response = await fetch(`${API_URL}/testimonials/admin/${id}/publish`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_published: !currentStatus })
        });

        if (response.ok) {
            await loadReviews();
            alert(!currentStatus ? 'Отзыв опубликован' : 'Отзыв скрыт');
        } else {
            alert('Ошибка при изменении статуса');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при изменении статуса');
    }
};

// Отметить как избранный - ИСПРАВЛЕНО
const toggleFeatured = async (id, currentStatus) => {
    try {
        const token = getToken();
        // ✅ /api/testimonials/admin/:id
        const response = await fetch(`${API_URL}/testimonials/admin/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_featured: !currentStatus })
        });

        if (response.ok) {
            await loadReviews();
            alert(!currentStatus ? 'Добавлен в избранное' : 'Убран из избранного');
        } else {
            alert('Ошибка при изменении статуса');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при изменении статуса');
    }
};

// Удаление отзыва - ИСПРАВЛЕНО
const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
    
    try {
        const token = getToken();
        // ✅ /api/testimonials/admin/:id
        const response = await fetch(`${API_URL}/testimonials/admin/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadReviews();
            alert('Отзыв удалён');
        } else {
            alert('Ошибка при удалении');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении');
    }
};

    // Фильтрация отзывов
    const getFilteredReviews = () => {
        switch (filter) {
            case 'pending':
                return reviews.filter(r => !r.is_published);
            case 'published':
                return reviews.filter(r => r.is_published);
            default:
                return reviews;
        }
    };

    const getRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
                    ★
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    useEffect(() => {
        loadReviews();
    }, []);

    if (loading) {
        return (
            <div className="admin-reviews-page">
                <Loader type="spinner" size="large" text="Загрузка отзывов..." />
            </div>
        );
    }

    const filteredReviews = getFilteredReviews();

    return (
        <div className="admin-reviews-page">
            <div className="admin-reviews-container">
                <div className="admin-reviews-header">
                    <Typography variant="h1" weight="bold">
                        Модерация отзывов
                    </Typography>
                    <Typography variant="body" color="default">
                        Управление отзывами клиентов: публикация, скрытие, удаление
                    </Typography>
                </div>

                {/* Статистика */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Всего отзывов</div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">На модерации</div>
                    </div>
                    <div className="stat-card published">
                        <div className="stat-value">{stats.published}</div>
                        <div className="stat-label">Опубликовано</div>
                    </div>
                </div>

                {/* Фильтры */}
                <div className="admin-filters">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Все ({stats.total})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        На модерации ({stats.pending})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
                        onClick={() => setFilter('published')}
                    >
                        Опубликованные ({stats.published})
                    </button>
                </div>

                {/* Список отзывов */}
                <div className="admin-reviews-list">
                    {filteredReviews.length === 0 ? (
                        <div className="empty-state">
                            <Typography variant="body" color="default">
                                {filter === 'pending' 
                                    ? 'Нет отзывов на модерации' 
                                    : filter === 'published'
                                    ? 'Нет опубликованных отзывов'
                                    : 'Нет отзывов'}
                            </Typography>
                        </div>
                    ) : (
                        filteredReviews.map(review => (
                            <div key={review.id} className={`admin-review-card ${!review.is_published ? 'pending' : ''}`}>
                                <div className="review-status-badge">
                                    {review.is_published ? (
                                        <span className="status published">✓ Опубликован</span>
                                    ) : (
                                        <span className="status pending">⏳ На модерации</span>
                                    )}
                                    {review.is_featured && (
                                        <span className="status featured">⭐ Избранный</span>
                                    )}
                                </div>
                                
                                <div className="review-content">
                                    <div className="review-header">
                                        <div className="review-avatar">
                                            <span>{review.client_name?.charAt(0) || 'К'}</span>
                                        </div>
                                        <div className="review-info">
                                            <h4>{review.client_name}</h4>
                                            {review.client_company && (
                                                <span className="review-company">{review.client_company}</span>
                                            )}
                                            <div className="review-rating">{getRatingStars(review.rating)}</div>
                                        </div>
                                        <div className="review-date">
                                            {formatDate(review.date || review.created_at)}
                                        </div>
                                    </div>
                                    
                                    <div className="review-text">
                                        <p>{review.text}</p>
                                    </div>
                                    
                                    {review.project_id && (
                                        <div className="review-project">
                                            <span>📁 Проект: {review.project_title || review.project_id}</span>
                                        </div>
                                    )}
                                    
                                    {review.client_email && (
                                        <div className="review-contact">
                                            <span>✉️ {review.client_email}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="review-actions">
                                    <button 
                                        className={`action-btn publish ${review.is_published ? 'unpublish' : ''}`}
                                        onClick={() => togglePublish(review.id, review.is_published)}
                                    >
                                        {review.is_published ? '🙈 Скрыть' : '✅ Опубликовать'}
                                    </button>
                                    <button 
                                        className={`action-btn featured ${review.is_featured ? 'active' : ''}`}
                                        onClick={() => toggleFeatured(review.id, review.is_featured)}
                                    >
                                        {review.is_featured ? '⭐ Убрать из избранного' : '☆ В избранное'}
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
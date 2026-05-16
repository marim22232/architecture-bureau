// src/pages/adminn/AdminReviews/AdminReviews.jsx
import React, { useState, useEffect } from 'react';
import './AdminReviews.css';
import Typography from '../../../components/UI/Typography/Typography.jsx';
import Loader from '../../../components/UI/Loader/Loader.jsx';
import Icons from '../../../components/UI/Icons/Icons.jsx'; // ✅ Добавить импорт иконок
import { useModal } from '../../../hooks/useModal';

const API_URL = '';
const getToken = () => localStorage.getItem('token');

const AdminReviews = () => {
    const { showConfirm, showAlert, ConfirmModalComponent, AlertModalComponent } = useModal();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, pending: 0, published: 0 });

    const loadReviews = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch('/api/testimonials/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Ошибка загрузки');

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
            showAlert('Ошибка при загрузке отзывов', 'Ошибка');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/testimonials/admin/${id}/publish`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_published: !currentStatus })
            });

            if (response.ok) {
                await loadReviews();
                showAlert(!currentStatus ? 'Отзыв опубликован' : 'Отзыв скрыт');
            } else {
                showAlert('Ошибка при изменении статуса', 'Ошибка');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showAlert('Ошибка при изменении статуса', 'Ошибка');
        }
    };

    const toggleFeatured = async (id, currentStatus) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/testimonials/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_featured: !currentStatus })
            });

            if (response.ok) {
                await loadReviews();
                showAlert(!currentStatus ? 'Добавлен в избранное' : 'Убран из избранного');
            } else {
                showAlert('Ошибка при изменении статуса', 'Ошибка');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showAlert('Ошибка при изменении статуса', 'Ошибка');
        }
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.',
            async () => {
                try {
                    const token = getToken();
                    const response = await fetch(`/api/testimonials/admin/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        await loadReviews();
                        showAlert('Отзыв удалён');
                    } else {
                        showAlert('Ошибка при удалении', 'Ошибка');
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                    showAlert('Ошибка при удалении', 'Ошибка');
                }
            },
            'Подтверждение удаления'
        );
    };

    const getFilteredReviews = () => {
        switch (filter) {
            case 'pending': return reviews.filter(r => !r.is_published);
            case 'published': return reviews.filter(r => r.is_published);
            default: return reviews;
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
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        Все ({stats.total})
                    </button>
                    <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        <Icons.Clock size={14} color="#ffc107" /> На модерации ({stats.pending})
                    </button>
                    <button className={`filter-btn ${filter === 'published' ? 'active' : ''}`} onClick={() => setFilter('published')}>
                        <Icons.Check size={14} color="#28a745" /> Опубликованные ({stats.published})
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
                                        <span className="status published">
                                            <Icons.Check size={14} color="#28a745" /> Опубликован
                                        </span>
                                    ) : (
                                        <span className="status pending">
                                            <Icons.Clock size={14} color="#ffc107" /> На модерации
                                        </span>
                                    )}
                                    {review.is_featured && (
                                        <span className="status featured">
                                            <Icons.Heart size={14} color="#ffc107" /> Избранный
                                        </span>
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
                                                <span className="review-company">
                                                    <Icons.Building size={12} color="#999" /> {review.client_company}
                                                </span>
                                            )}
                                            <div className="review-rating">{getRatingStars(review.rating)}</div>
                                        </div>
                                        <div className="review-date">
                                            <Icons.Calendar size={12} color="#999" /> {formatDate(review.date || review.created_at)}
                                        </div>
                                    </div>

                                    <div className="review-text">
                                        <p>{review.text}</p>
                                    </div>

                                    {review.project_id && (
                                        <div className="review-project">
                                            <Icons.Folder size={14} color="#3a5a6a" /> Проект: {review.project_title || review.project_id}
                                        </div>
                                    )}

                                    {review.client_email && (
                                        <div className="review-contact">
                                            <Icons.Email size={14} color="#3a5a6a" /> {review.client_email}
                                        </div>
                                    )}
                                </div>

                                <div className="review-actions">
                                    <button
                                        className={`action-btn publish ${review.is_published ? 'unpublish' : ''}`}
                                        onClick={() => togglePublish(review.id, review.is_published)}
                                    >
                                        {review.is_published ? (
                                            <>
                                                <Icons.Eye size={16} /> Скрыть
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Check size={16} /> Опубликовать
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className={`action-btn featured ${review.is_featured ? 'active' : ''}`}
                                        onClick={() => toggleFeatured(review.id, review.is_featured)}
                                    >
                                        {review.is_featured ? (
                                            <>
                                                <Icons.Heart size={16} color="#ffc107" /> Убрать из избранного
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Heart size={16} /> В избранное
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        <Icons.Trash size={16} /> Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmModalComponent />
            <AlertModalComponent />
        </div>
    );
};

export default AdminReviews;
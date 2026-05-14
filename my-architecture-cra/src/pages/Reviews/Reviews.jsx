// src/pages/Reviews/Reviews.jsx
import React, { useState, useEffect } from 'react';
import './Reviews.css';
import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import Icons from '../../components/UI/Icons/Icons.jsx';
import Loader from '../../components/UI/Loader/Loader.jsx';
import ReviewFormModal from '../../components/Auth/ReviewFormModal/ReviewFormModal';
import { updateMyTestimonial, deleteMyTestimonial } from '../../services/api.js';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(6);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userProjects, setUserProjects] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [hasExistingReview, setHasExistingReview] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [editingReview, setEditingReview] = useState(null); // ⭐ ДОБАВИТЬ

    useEffect(() => {
        loadReviews();
        checkAuthAndLoadProjects();
    }, []);

    // ⭐ Обработчик обновления отзыва
    const handleUpdateReview = async (data, isEditing) => {
        if (!isEditing) return;
        
        const result = await updateMyTestimonial(data.id, {
            text: data.text,
            rating: data.rating
        });
        
        if (result.success) {
            alert('Отзыв успешно обновлен');
            loadReviews(); // Обновить список
            setEditingReview(null);
        } else {
            alert(result.error || 'Ошибка при обновлении отзыва');
            throw new Error(result.error);
        }
    };

    // ⭐ Обработчик удаления отзыва
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Вы уверены, что хотите удалить свой отзыв?')) return;
        
        const result = await deleteMyTestimonial(reviewId);
        if (result.success) {
            alert('Отзыв удален');
            loadReviews();
        } else {
            alert(result.error || 'Ошибка при удалении отзыва');
        }
    };

    const checkAuthAndLoadProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 1. Токен в localStorage:', token ? `${token.substring(0, 50)}...` : 'НЕТ ТОКЕНА');
            
            if (!token) {
                console.log('❌ Токен отсутствует');
                setIsAuthenticated(false);
                setAuthChecked(true);
                return;
            }

            console.log('📡 2. Запрос /api/auth/me');
            const userResponse = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!userResponse.ok) {
                console.error('❌ Ошибка авторизации:', userResponse.status);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setAuthChecked(true);
                return;
            }

            const userData = await userResponse.json();
            const user = userData.user || userData;
            setIsAuthenticated(true);
            setUserInfo(user);
            
            await loadUserProjects(token);
            
        } catch (error) {
            console.error('❌ Ошибка проверки авторизации:', error);
            setIsAuthenticated(false);
            setAuthChecked(true);
        }
    };

    const loadUserProjects = async (token) => {
        try {
            console.log('📡 3. Запрос проектов клиента');
            
            const endpoints = [
                'http://localhost:5000/api/projects/my-projects',
                'http://localhost:5000/api/clients/my-projects',
                'http://localhost:5000/api/projects/client'
            ];
            
            let projectsData = null;
            
            for (const endpoint of endpoints) {
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    projectsData = await response.json();
                    break;
                }
            }
            
            if (!projectsData) {
                setUserProjects([]);
                setAuthChecked(true);
                return;
            }
            
            let projects = [];
            if (projectsData.projects && Array.isArray(projectsData.projects)) {
                projects = projectsData.projects;
            } else if (projectsData.data && Array.isArray(projectsData.data)) {
                projects = projectsData.data;
            } else if (Array.isArray(projectsData)) {
                projects = projectsData;
            }
            
            const completedProjects = projects.filter(p => 
                p.status === 'built' || p.status === 'completed' || 
                p.status === 'done' || p.status === 'finished'
            );
            
            setUserProjects(completedProjects);
            await checkExistingReviews(token);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки проектов:', error);
            setUserProjects([]);
        } finally {
            setAuthChecked(true);
        }
    };

    const checkExistingReviews = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/testimonials/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.testimonials && result.testimonials.length > 0) {
                    setHasExistingReview(true);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка проверки отзывов:', error);
        }
    };

    const loadReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/testimonials?published=true');
            
            if (response.ok) {
                let data = await response.json();
                if (Array.isArray(data)) {
                    setReviews(data);
                } else if (data.testimonials) {
                    setReviews(data.testimonials);
                } else {
                    setReviews([]);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async (reviewData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/testimonials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: reviewData.project_id,
                    text: reviewData.text,
                    rating: reviewData.rating
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(result.message);
                setIsModalOpen(false);
                setHasExistingReview(true);
                loadReviews(); // Обновить список отзывов
            } else {
                alert(result.error || 'Ошибка при добавлении отзыва');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            alert('Произошла ошибка при отправке отзыва');
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

    const filteredReviews = filter === 'all' 
        ? reviews 
        : reviews.filter(r => r.rating === parseInt(filter));

    const displayedReviews = filteredReviews.slice(0, visibleCount);
    const hasMore = visibleCount < filteredReviews.length;
    const canLeaveReview = isAuthenticated && userProjects.length > 0 && !hasExistingReview;

    const stats = {
        total: reviews.length,
        average: reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
            : '0',
        fiveStar: reviews.filter(r => r.rating === 5).length,
        fourStar: reviews.filter(r => r.rating === 4).length,
        threeStar: reviews.filter(r => r.rating === 3).length,
    };

    if (loading || !authChecked) {
        return (
            <div className="reviews-page">
                <Loader type="spinner" size="large" text="Загрузка..." />
            </div>
        );
    }

    return (
        <div className="reviews-page">
            <div className="reviews-container">
                <div className="reviews-hero">
                    <Typography variant="h1" color="white" align="center" weight="bold">
                        Отзывы наших клиентов
                    </Typography>
                    <Typography variant="body" color="white" align="center">
                        Мы дорожим мнением каждого клиента и стремимся к совершенству
                    </Typography>
                    
                    {canLeaveReview && (
                        <div className="hero-button" style={{ marginTop: '30px' }}>
                            <MyButton variant="primary" size="large" onClick={() => setIsModalOpen(true)}>
                                ✍️ Оставить отзыв
                            </MyButton>
                        </div>
                    )}
                    
                    {isAuthenticated && userProjects.length === 0 && !hasExistingReview && (
                        <div className="hero-message" style={{ marginTop: '20px', padding: '12px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                            <Typography variant="body" color="white" align="center">
                                У вас пока нет завершенных проектов, чтобы оставить отзыв
                            </Typography>
                        </div>
                    )}
                    
                    {isAuthenticated && hasExistingReview && (
                        <div className="hero-message" style={{ marginTop: '20px', padding: '12px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                            <Typography variant="body" color="white" align="center">
                                Спасибо за ваш отзыв! Вы уже оставили отзыв о нашем сотрудничестве.
                            </Typography>
                        </div>
                    )}
                    
                    {!isAuthenticated && (
                        <div className="hero-message" style={{ marginTop: '20px' }}>
                            <Typography variant="body" color="white" align="center">
                                Войдите в аккаунт, чтобы оставить отзыв о проекте
                            </Typography>
                        </div>
                    )}
                </div>

                <div className="reviews-stats">
                    <div className="stats-card">
                        <div className="stats-value">{stats.total}</div>
                        <Typography variant="small" color="default">Всего отзывов</Typography>
                    </div>
                    <div className="stats-card">
                        <div className="stats-value">{stats.average}</div>
                        <div className="stats-stars">{getRatingStars(Math.round(stats.average))}</div>
                        <Typography variant="small" color="default">Средняя оценка</Typography>
                    </div>
                    <div className="stats-card">
                        <div className="stats-value">100%</div>
                        <Typography variant="small" color="default">Рекомендуют нас</Typography>
                    </div>
                </div>

                {reviews.length > 0 && (
                    <div className="reviews-filters">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            Все ({stats.total})
                        </button>
                        {stats.fiveStar > 0 && (
                            <button className={`filter-btn ${filter === '5' ? 'active' : ''}`} onClick={() => setFilter('5')}>
                                5 ★ ({stats.fiveStar})
                            </button>
                        )}
                        {stats.fourStar > 0 && (
                            <button className={`filter-btn ${filter === '4' ? 'active' : ''}`} onClick={() => setFilter('4')}>
                                4 ★ ({stats.fourStar})
                            </button>
                        )}
                        {stats.threeStar > 0 && (
                            <button className={`filter-btn ${filter === '3' ? 'active' : ''}`} onClick={() => setFilter('3')}>
                                3 ★ ({stats.threeStar})
                            </button>
                        )}
                    </div>
                )}

                <div className="reviews-grid">
                    {displayedReviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-avatar">
                                    <span>{review.client_name?.charAt(0) || 'К'}</span>
                                </div>
                                <div className="review-info">
                                    <h4>{review.client_name}</h4>
                                    <div className="review-rating">{getRatingStars(review.rating)}</div>
                                </div>
                                {/* ⭐ Кнопки редактирования/удаления для своих отзывов */}
                                {isAuthenticated && userInfo?.email === review.client_email && (
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                        <button
                                            onClick={() => setEditingReview(review)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReview(review.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="review-content">
                                <p>{review.text}</p>
                            </div>
                            {/* ⭐ Ссылка на проект */}
                            {review.project_slug && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                                    <a 
                                        href={`/projects/${review.project_slug}`}
                                        style={{ color: '#3a5a6a', textDecoration: 'none', fontSize: '14px' }}
                                    >
                                        🔗 Посмотреть проект
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="reviews-show-more">
                        <MyButton variant="secondary" onClick={() => setVisibleCount(prev => prev + 6)}>
                            Показать ещё
                        </MyButton>
                    </div>
                )}
            </div>

            {/* Модалка создания отзыва */}
            <ReviewFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddReview}
                projects={userProjects}
                userInfo={userInfo}
                onSuccess={() => {
                    loadReviews();
                    setHasExistingReview(true);
                }}
            />

            {/* ⭐ Модалка редактирования отзыва */}
            <ReviewFormModal
                isOpen={!!editingReview}
                onClose={() => setEditingReview(null)}
                onSubmit={handleUpdateReview}
                projects={userProjects}
                userInfo={userInfo}
                review={editingReview}
                isEditing={true}
                onSuccess={() => {
                    loadReviews();
                    setEditingReview(null);
                }}
            />
        </div>
    );
};

export default Reviews;
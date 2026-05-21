import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFullProjectBySlug } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils.js';

import Typography from '../../components/UI/Typography/Typography.jsx';      // ✅ правильно
import MyButton from '../../components/UI/MyButton/MyButton.jsx';            // ✅ правильно
import MyButtonOutline from '../../components/UI/MyButtonOutline/MyButtonOutline.jsx'; // ✅ правильно
import Loader from '../../components/UI/Loader/Loader.jsx';                  // ✅ правильно
import Icons from '../../components/UI/Icons/Icons.jsx';                     // ✅ правильно
import ExpandableText from '../../components/UI/ExpandableText/ExpandableText.jsx'; // ✅ правильно
import './ProjectPage.css'

const ProjectPage = () => {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const response = await getFullProjectBySlug(slug);

                console.log('=== FULL API RESPONSE ===');
                console.log('Response:', response);
                console.log('Response.success:', response.success);
                console.log('Response.data:', response.data);

                // ✅ ПРАВИЛЬНАЯ ОБРАБОТКА
                // Сервер возвращает { success: true, data: { ...project } }
                if (response && response.success && response.data) {
                    const projectData = response.data;
                    console.log('✅ Project data extracted:', projectData);
                    console.log('Images:', projectData.images);
                    console.log('Rooms:', projectData.rooms);
                    console.log('Team:', projectData.team);
                    setProject(projectData);
                } else if (response && response.id) {
                    // Если ответ - сам объект проекта
                    console.log('✅ Response is project object');
                    setProject(response);
                } else {
                    console.error('❌ Unexpected response format:', response);
                    setError('Не удалось загрузить данные проекта');
                }

                window.scrollTo(0, 0);
            } catch (err) {
                console.error('❌ Ошибка загрузки проекта:', err);
                setError(err.message || 'Проект не найден');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProject();
        }
    }, [slug]);
    // Формируем массив всех изображений
    const allImages = [];
    if (project?.main_image) {
        allImages.push({ image_url: project.main_image, is_main: true, caption: project.title });
    }
    if (project?.images?.length) {
        allImages.push(...project.images);
    }

    const handlePrevImage = () => {
        setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    const getClientName = () => {
        // Если client - объект с full_name
        if (project?.client?.full_name) {
            return project.client.full_name;
        }
        // Если client - объект с отдельными полями
        if (project?.client?.first_name || project?.client?.last_name) {
            return `${project.client.last_name || ''} ${project.client.first_name || ''} ${project.client.patronymic || ''}`.trim();
        }
        // Если client_full_name напрямую в проекте
        if (project?.client_full_name) {
            return project.client_full_name;
        }
        // Если client - строка
        if (project?.client && typeof project.client === 'string') {
            return project.client;
        }
        // Если есть отдельные поля в проекте
        if (project?.last_name || project?.first_name) {
            return `${project.last_name || ''} ${project.first_name || ''} ${project.patronymic || ''}`.trim();
        }
        return null;
    };

    const getRoomIcon = (roomName) => {
        if (roomName.includes('Гостиная')) return '🛋️';
        if (roomName.includes('Кухня')) return '🍳';
        if (roomName.includes('Спальня')) return '🛏️';
        if (roomName.includes('Ванная')) return '🚿';
        if (roomName.includes('Кабинет')) return '📚';
        if (roomName.includes('Гардероб')) return '👔';
        if (roomName.includes('Терраса')) return '🌿';
        if (roomName.includes('Бассейн')) return '🏊';
        return '📐';
    };

    if (loading) {
        return (
            <div className="project-page-loader">
                <Loader type="spinner" size="large" text="Загрузка проекта..." />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="project-page-error">
                <div className="container">
                    <div className="error-content">
                        <Icons.Close size={64} color="#3a5a6a" />
                        <Typography variant="h2">Проект не найден</Typography>
                        <Typography variant="body" color="gray">
                            {error || 'К сожалению, запрашиваемый проект не существует.'}
                        </Typography>
                        <Link to="/projects">
                            <MyButton>Вернуться к проектам</MyButton>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="project-page">
            {/* Hero секция */}
            <section className="project-hero">
                <div className="container">
                    <div className="hero-content">
                        <Typography variant="h1" weight="bold" color='primary'>
                            {project.title}
                        </Typography>
                        <div className="hero-location">
                            <Icons.Location size={20} color="primary" />
                            <Typography variant="body" color="primary">{project.location}</Typography>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <Typography variant="small" color="accent">Площадь</Typography>
                                <Typography variant="h3" weight="bold" color="accent">{project.area} м²</Typography>
                            </div>
                            <div className="stat-card">
                                <Typography variant="small" color="accent">Год</Typography>
                                <Typography variant="h3" weight="bold" color="accent">{project.project_year}</Typography>
                            </div>
                            <div className="stat-card">
                                <Typography variant="small" color="accent">Тип</Typography>
                                <Typography variant="h4" color="accent">{project.project_type_name || '—'}</Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Галерея */}
            {allImages.length > 0 && (
                <section className="project-gallery">
                    <div className="container">
                        <div className="gallery-main">
                            {allImages.length > 1 && (
                                <button className="gallery-nav prev" onClick={handlePrevImage}>
                                    <Icons.ChevronLeft size={32} />
                                </button>
                            )}

                            <div className="gallery-image">
                            <img src={getImageUrl(allImages[activeImage].image_url)} alt={project.title} />
                            </div>

                            {allImages.length > 1 && (
                                <button className="gallery-nav next" onClick={handleNextImage}>
                                    <Icons.ChevronRight size={32} />
                                </button>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="gallery-thumbnails">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                                        onClick={() => setActiveImage(idx)}
                                    >
                                    <img src={getImageUrl(img.image_url)} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Контент */}
            <section className="project-content">
                <div className="container">
                    <div className="project-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <span>📋</span>
                            <span>Обзор</span>
                        </button>

                        {project.rooms?.length > 0 && (
                            <button
                                className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('rooms')}
                            >
                                <span>🪑</span>
                                <span>Помещения ({project.rooms.length})</span>
                            </button>
                        )}

                        {project.team?.length > 0 && (
                            <button
                                className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
                                onClick={() => setActiveTab('team')}
                            >
                                <span>👥</span>
                                <span>Команда ({project.team.length})</span>
                            </button>
                        )}
                    </div>

                    <div className="tab-content">
                        {/* Обзор */}
                        {activeTab === 'overview' && (
                            <div className="overview-content">
                                {project.description && (
                                    <div className="project-description">
                                        <Typography variant="h3" weight="semibold">
                                            Описание проекта
                                        </Typography>
                                        
                                    </div>
                                )}

                                <div className="project-details">
                                    <Typography variant="h3" weight="semibold">
                                        Детали
                                    </Typography>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <Icons.Location size={20} />
                                            <div>
                                                <Typography variant="small" color="gray">Локация</Typography>
                                                <Typography variant="body">{project.location}</Typography>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <Icons.Calendar size={20} />
                                            <div>
                                                <Typography variant="small" color="gray">Год</Typography>
                                                <Typography variant="body">{project.project_year}</Typography>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <Icons.Ruler size={20} />
                                            <div>
                                                <Typography variant="small" color="gray">Площадь</Typography>
                                                <Typography variant="body">{project.area} м²</Typography>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {getClientName() && (
                                    <div className="project-client">
                                        <Typography variant="h3" weight="semibold">
                                            Клиент
                                        </Typography>
                                        <div className="client-card">
                                            <div className="client-icon">
                                                <Icons.User size={40} />
                                            </div>
                                            <div className="client-info">
                                                <Typography variant="h4" weight="semibold">
                                                    {getClientName()}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Комнаты */}
                        {activeTab === 'rooms' && project.rooms?.length > 0 && (
                            <div className="rooms-grid">
                                {project.rooms.map((room) => (
                                    <div key={room.id} className="room-card">
                                        <div className="room-icon">{getRoomIcon(room.name)}</div>
                                        <div className="room-info">
                                            <Typography variant="h4" weight="semibold">
                                                {room.name}
                                            </Typography>
                                            <Typography variant="h3" weight="bold" color="accent">
                                                {room.area} м²
                                            </Typography>
                                            {room.description && (
                                                <Typography variant="small" color="gray">
                                                    {room.description}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Команда */}
                        {activeTab === 'team' && project.team?.length > 0 && (
                            <div className="team-grid">
                                {project.team.map((member) => (
                                    <div key={member.id} className="team-card">
                                        <div className="team-photo">
                                            {member.photo ? (
                                            <img src={getImageUrl(member.photo)} alt={member.name} />) : (
                                                <div className="team-avatar">
                                                    {member.name?.charAt(0) || '👤'}
                                                </div>
                                            )}
                                            {/* Бейдж team lead */}
                                            {member.team_lead && (
                                                <div className="team-lead-badge">
                                                    Руководитель
                                                </div>
                                            )}
                                        </div>
                                        <div className="team-info">
                                            <Typography variant="h4" weight="semibold">
                                                {member.name}
                                            </Typography>
                                            <Typography variant="small" color="accent" weight="medium">
                                                {member.role}
                                            </Typography>
                                            {member.position && (
                                                <Typography variant="small" color="gray">
                                                    {member.position}
                                                </Typography>
                                            )}

                                            {/* Дополнительная информация */}
                                            <div className="team-details">
                                                {member.experience_years > 0 && (
                                                    <div className="team-detail">
                                                        <span>💼</span> Опыт: {member.experience_years} лет
                                                    </div>
                                                )}
                                                {member.projects_count > 0 && (
                                                    <div className="team-detail">
                                                        <span>🏗️</span> Проектов: {member.projects_count}
                                                    </div>
                                                )}
                                                {member.specialization && (
                                                    <div className="team-detail">
                                                        <span>🎯</span> {member.specialization}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Образование и награды */}
                                            {member.education && (
                                                <div className="team-education">
                                                    <Typography variant="small" weight="semibold" color="dark">
                                                        Образование:
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        {member.education}
                                                    </Typography>
                                                </div>
                                            )}

                                            {member.awards && (
                                                <div className="team-awards">
                                                    <Typography variant="small" weight="semibold" color="dark">
                                                        🏆 Награды:
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        {member.awards}
                                                    </Typography>
                                                </div>
                                            )}

                                            {/* Рейтинг */}
                                            {member.rating && (
                                                <div className="team-rating">
                                                    {'⭐'.repeat(Math.floor(member.rating))}
                                                    <span className="rating-value">{member.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

                       {/* Кнопки навигации */}
            {/* Кнопки навигации */}
<div className="project-back">
    <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <Link to="/projects">
                <MyButtonOutline>
                    <Icons.ArrowLeft size={18} />
                    <span>Все проекты</span>
                </MyButtonOutline>
            </Link>
            
            {/* Кнопка редактирования - видна только администратору */}
            {localStorage.getItem('userRole') === 'admin' && (
                <Link to={`/admin/edit/${project.id}`}>  {/* ← ИСПРАВЛЕНО */}
                    <MyButton variant="primary">
                        <Icons.Edit size={18} style={{ marginRight: '8px' }} />
                        Редактировать проект
                    </MyButton>
                </Link>
            )}
        </div>
    </div>
</div>
        </div>
    );
};

export default ProjectPage;
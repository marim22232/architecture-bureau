import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';
import './MyProjectsNew.css';

import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import Icons from '../../components/UI/Icons/Icons.jsx';
import Loader from '../../components/UI/Loader/Loader.jsx';

const MyProjectsNew = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        built: 0,
        inProgress: 0,
        concept: 0,
        totalArea: 0
    });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        
        try {
            const result = await profileAPI.getMyProjects();
            console.log('=== API RESPONSE ===', result);

            if (result.success && result.projects) {
                setProjects(result.projects);

                const newStats = {
                    total: result.projects.length,
                    built: result.projects.filter(p => p.status === 'built').length,
                    inProgress: result.projects.filter(p => p.status === 'in_progress').length,
                    concept: result.projects.filter(p => p.status === 'concept').length,
                    totalArea: result.projects.reduce((sum, p) => sum + (Number(p.area) || 0), 0)
                };
                setStats(newStats);
            } else {
                console.warn('No projects or success false');
                setProjects([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'built': return 'Построен';
            case 'in_progress': return 'В процессе';
            case 'concept': return 'Концепция';
            default: return 'Проект';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'built': return '🏗️';
            case 'in_progress': return '🔄';
            case 'concept': return '💡';
            default: return '📁';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'built': return '#2e7d32';
            case 'in_progress': return '#ed6c02';
            case 'concept': return '#0288d1';
            default: return '#757575';
        }
    };

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.status === filter);

    if (loading) {
        return (
            <div className="my-projects-new">
                <Loader type="spinner" size="large" text="Загрузка ваших проектов..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-projects-new">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <Typography variant="body" color="default">Ошибка: {error}</Typography>
                    <MyButton onClick={loadProjects} variant="primary" style={{ marginTop: '20px' }}>
                        Повторить
                    </MyButton>
                </div>
            </div>
        );
    }

    return (
        <div className="my-projects-new">
            <div className="container">
                <div className="header">
                    <div className="header-title">
                        <Typography variant="h1" color="dark" weight="bold">Мои проекты</Typography>
                        <Typography variant="body" color="primary">Управление и просмотр ваших архитектурных работ</Typography>
                    </div>
                    <MyButton onClick={() => navigate(-1)} variant="secondary" className="back-btn">
                        ← Назад
                    </MyButton>
                </div>

                <div className="statss">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Icons.Folder size={32} color="#A08972" />
                        </div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Всего проектов</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Icons.Building size={32} color="#A08972" />
                        </div>
                        <div className="stat-value">{stats.built}</div>
                        <div className="stat-label">Построено</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Icons.Ruler size={32} color="#A08972" />
                        </div>
                        <div className="stat-value">{stats.totalArea.toFixed(0)} м²</div>
                        <div className="stat-label">Общая площадь</div>
                    </div>
                </div>

                <div className="filters-section">
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            Все проекты
                            <span className="count">{stats.total}</span>
                        </button>
                        <button className={`filter-btn ${filter === 'built' ? 'active' : ''}`} onClick={() => setFilter('built')}>
                            <Icons.Building size={14} color="currentColor" /> Построены
                            <span className="count">{stats.built}</span>
                        </button>
                        <button className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}>
                            <Icons.Clock size={14} color="currentColor" /> В процессе
                            <span className="count">{stats.inProgress}</span>
                        </button>
                        <button className={`filter-btn ${filter === 'concept' ? 'active' : ''}`} onClick={() => setFilter('concept')}>
                            <Icons.Award size={14} color="currentColor" /> Концепции
                            <span className="count">{stats.concept}</span>
                        </button>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <Typography variant="h3" color="default" weight="medium">
                            {filter === 'all' ? 'У вас пока нет проектов' : `Нет проектов со статусом "${getStatusText(filter)}"`}
                        </Typography>
                        <Typography variant="body" color="default">
                            {filter === 'all' && 'Создайте свой первый проект, чтобы он появился здесь'}
                        </Typography>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {filteredProjects.map(project => (
                            <div key={project.id} className="project-card" onClick={() => setSelectedProject(project)}>
                                <div className="card-header">
                                    <div className="project-icon">
                                        <Icons.Building size={32} color="white" />
                                    </div>
                                    <div className={`status-badge ${project.status}`}>
                                        {getStatusIcon(project.status)} {getStatusText(project.status)}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <Typography variant="h3" color="dark" weight="bold" className="project-title">
                                        {project.title}
                                    </Typography>
                                    <div className="project-details">
                                        <div className="detail-item">
                                            <Icons.Location size={16} color="#A08972" />
                                            <Typography variant="small" color="primary">
                                                {project.location || 'Локация не указана'}
                                            </Typography>
                                        </div>
                                        <div className="detail-item">
                                            <Icons.Calendar size={16} color="#A08972" />
                                            <Typography variant="small" color="primary">
                                                {project.project_year || 'Год не указан'}
                                            </Typography>
                                        </div>
                                        <div className="detail-item">
                                            <Icons.Ruler size={16} color="#A08972" />
                                            <Typography variant="small" color="primary">
                                                Площадь: {project.area} м²
                                            </Typography>
                                        </div>
                                        {project.team_role && (
                                            <div className="detail-item">
                                                <Icons.Briefcase size={16} color="#A08972" />
                                                <Typography variant="small" color="primary">
                                                    Роль: {project.team_role}
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <MyButton variant="text" className="view-details-btn">
                                        Подробнее →
                                    </MyButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedProject && (
                    <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setSelectedProject(null)}>
                                <Icons.Close size={20} color="white" />
                            </button>
                            <div className="modal-image">
                                {selectedProject.main_image && selectedProject.main_image.trim() !== '' ? (
                                    <img src={`http://localhost:5000${selectedProject.main_image}`} alt={selectedProject.title} />
                                ) : (
                                    <div className="image-placeholder" style={{ height: '250px' }}>
                                        <Icons.Building size={48} color="#8ba5b5" />
                                    </div>
                                )}
                            </div>
                            <div className="modal-content">
                                <Typography variant="h2" color="dark" weight="bold">{selectedProject.title}</Typography>
                                <div className="modal-details-grid">
                                    <div className="modal-detail">
                                        <Icons.Location size={20} color="#A08972" />
                                        <div>
                                            <label>Локация</label>
                                            <p>{selectedProject.location || 'Не указана'}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Icons.Calendar size={20} color="#A08972" />
                                        <div>
                                            <label>Год</label>
                                            <p>{selectedProject.project_year || 'Не указан'}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Icons.Ruler size={20} color="#A08972" />
                                        <div>
                                            <label>Площадь</label>
                                            <p>{selectedProject.area} м²</p>
                                        </div>
                                    </div>
                                    {selectedProject.team_role && (
                                        <div className="modal-detail">
                                            <Icons.Briefcase size={20} color="#A08972" />
                                            <div>
                                                <label>Моя роль</label>
                                                <p>{selectedProject.team_role}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {selectedProject.description && (
                                    <div className="modal-description">
                                        <label>Описание проекта</label>
                                        <p>{selectedProject.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProjectsNew;
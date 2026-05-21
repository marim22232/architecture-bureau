// src/pages/MyProjects/MyProjects.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../../services/api.js';
import './MyProjects.css';

import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import Icons from '../../components/UI/Icons/Icons.jsx'; // ← ВЕРНУЛ ИМПОРТ ИКОНОК

const MyProjects = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        built: 0,
        inProgress: 0,
        concept: 0,
        totalArea: 0
    });
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const result = await profileAPI.getMyProjects();
            console.log('=== API RESPONSE ===');
            console.log('Full result:', result);
            console.log('Success:', result.success);
            console.log('Projects:', result.projects);
            console.log('Projects length:', result.projects?.length);

            if (result.success && result.projects) {
                console.log('First project:', result.projects[0]);
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
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'built': 'Построен',
            'in_progress': 'В процессе',
            'concept': 'Концепция'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classMap = {
            'built': 'status-built',
            'in_progress': 'status-progress',
            'concept': 'status-concept'
        };
        return `project-status ${classMap[status] || ''}`;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'built': return '✅';
            case 'in_progress': return '🔄';
            case 'concept': return '💡';
            default: return '📁';
        }
    };

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.status === filter);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };

    const closeProjectDetail = () => {
        setSelectedProject(null);
    };

    if (isLoading) {
        return (
            <div className="my-projects-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <Typography variant="body" color="primary">Загрузка ваших проектов...</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="my-projects-page">
            <div className="my-projects-container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <Icons.Folder size={40} color="#3a5a6a" />
                        </div>
                        <div>
                            <Typography variant="h2" weight="bold" color="dark">
                                Мои проекты
                            </Typography>
                            <Typography variant="body" color="primary">
                                Проекты, над которыми я работал(а)
                            </Typography>
                        </div>
                    </div>
                    <MyButton variant="secondary" onClick={() => navigate(-1)}>
                        ← Назад
                    </MyButton>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Всего проектов</div>
                        <div className="stat-icon">📊</div>
                    </div>
                    <div className="stat-card stat-built">
                        <div className="stat-value">{stats.built}</div>
                        <div className="stat-label">Построено</div>
                        <div className="stat-icon">✅</div>
                    </div>
                    <div className="stat-card stat-progress">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">В процессе</div>
                        <div className="stat-icon">🔄</div>
                    </div>
                    <div className="stat-card stat-concept">
                        <div className="stat-value">{stats.concept}</div>
                        <div className="stat-label">Концепции</div>
                        <div className="stat-icon">💡</div>
                    </div>
                    <div className="stat-card stat-area">
                        <div className="stat-value">{stats.totalArea.toFixed(0)}</div>
                        <div className="stat-label">Общая площадь, м²</div>
                        <div className="stat-icon">📐</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Все ({stats.total})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'built' ? 'active' : ''}`}
                            onClick={() => setFilter('built')}
                        >
                            ✅ Построены ({stats.built})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
                            onClick={() => setFilter('in_progress')}
                        >
                            🔄 В процессе ({stats.inProgress})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'concept' ? 'active' : ''}`}
                            onClick={() => setFilter('concept')}
                        >
                            💡 Концепции ({stats.concept})
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="no-projects">
                        <Icons.Folder size={64} color="#ccc" />
                        <Typography variant="h4" color="secondary" weight="medium">
                            {filter === 'all' ? 'У вас пока нет проектов' : 'Нет проектов в этой категории'}
                        </Typography>
                        <Typography variant="small" color="primary">
                            {filter === 'all'
                                ? 'Когда вы будете добавлены в проекты, они появятся здесь'
                                : 'Попробуйте выбрать другой фильтр'}
                        </Typography>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {filteredProjects.map(project => (
                            <div
                                key={project.id}
                                className="project-card"
                                onClick={() => handleProjectClick(project)}
                            >
                                <div className="project-image">
                                    {project.main_image ? (
                                        <img
                                            src={project.main_image || '/placeholder-project.jpg'}
                                            alt={project.title}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-project.jpg';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-image">
                                            <Icons.Image size={48} color="#ccc" />
                                        </div>
                                    )}
                                    <div className={getStatusClass(project.status)}>
                                        <span>{getStatusIcon(project.status)}</span>
                                        <span>{getStatusText(project.status)}</span>
                                    </div>
                                    {project.team_role && (
                                        <div className="project-role-badge">
                                            <Icons.User size={12} color="white" />
                                            <span>{project.team_role}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="project-info">
                                    <h3 className="project-title">{project.title}</h3>
                                    <div className="project-details">
                                        {project.location && (
                                            <div className="project-detail">
                                                <Icons.Location size={14} color="#6c8a9a" />
                                                <span>{project.location}</span>
                                            </div>
                                        )}
                                        {project.project_year && (
                                            <div className="project-detail">
                                                <Icons.Calendar size={14} color="#6c8a9a" />
                                                <span>{project.project_year}</span>
                                            </div>
                                        )}
                                        {project.area && (
                                            <div className="project-detail">
                                                <span>📐 {Number(project.area).toFixed(0)} м²</span>
                                            </div>
                                        )}
                                    </div>
                                    {project.description && (
                                        <div className="project-description">
                                            {project.description.length > 100
                                                ? `${project.description.substring(0, 100)}...`
                                                : project.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
                <div className="project-detail-modal-overlay" onClick={closeProjectDetail}>
                    <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="detail-modal-close" onClick={closeProjectDetail}>✕</button>

                        <div className="detail-modal-image">
                            {selectedProject.main_image ? (
                                <img
                                    src={selectedProject.main_image || '/placeholder-project.jpg'}
                                    alt={selectedProject.title}
                                />
                            ) : (
                                <div className="no-image-large">
                                    <Icons.Image size={64} color="#ccc" />
                                </div>
                            )}
                        </div>

                        <div className="detail-modal-content">
                            <Typography variant="h3" weight="bold" color="dark">
                                {selectedProject.title}
                            </Typography>

                            <div className="detail-modal-info">
                                <div className="detail-info-grid">
                                    <div className="detail-info-item">
                                        <Icons.Location size={18} color="#3a5a6a" />
                                        <div>
                                            <div className="info-label">Локация</div>
                                            <div className="info-value">{selectedProject.location || 'Не указана'}</div>
                                        </div>
                                    </div>
                                    <div className="detail-info-item">
                                        <Icons.Calendar size={18} color="#3a5a6a" />
                                        <div>
                                            <div className="info-label">Год</div>
                                            <div className="info-value">{selectedProject.project_year || 'Не указан'}</div>
                                        </div>
                                    </div>
                                    <div className="detail-info-item">
                                        <span>📐</span>
                                        <div>
                                            <div className="info-label">Площадь</div>
                                            <div className="info-value">{selectedProject.area ? `${Number(selectedProject.area).toFixed(0)} м²` : 'Не указана'}</div>
                                        </div>
                                    </div>
                                    <div className="detail-info-item">
                                        <div className={getStatusClass(selectedProject.status)} style={{ position: 'relative', top: 0, right: 0 }}>
                                            {getStatusIcon(selectedProject.status)} {getStatusText(selectedProject.status)}
                                        </div>
                                    </div>
                                </div>

                                {selectedProject.team_role && (
                                    <div className="role-highlight">
                                        <Icons.User size={18} color="#3a5a6a" />
                                        <div>
                                            <div className="info-label">Моя роль в проекте</div>
                                            <div className="info-value role-value">{selectedProject.team_role}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedProject.description && (
                                <div className="detail-modal-description">
                                    <Typography variant="body" weight="bold" color="dark">
                                        Описание проекта:
                                    </Typography>
                                    <Typography variant="body" color="secondary" className="description-text">
                                        {selectedProject.description}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProjects;
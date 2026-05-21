// src/components/Auth/MyProjectsModal/MyProjectsModal.jsx
import React, { useState, useEffect } from 'react';
import './MyProjectsModal.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton';
import Icons from '../../UI/Icons/Icons';
import { profileAPI } from '../../../services/api';

const MyProjectsModal = ({ isOpen, onClose }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        built: 0,
        inProgress: 0,
        concept: 0,
        totalArea: 0
    });

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const result = await profileAPI.getMyProjects();
            if (result.success) {
                setProjects(result.projects);
                
                // Подсчет статистики
                const newStats = {
                    total: result.projects.length,
                    built: result.projects.filter(p => p.status === 'built').length,
                    inProgress: result.projects.filter(p => p.status === 'in_progress').length,
                    concept: result.projects.filter(p => p.status === 'concept').length,
                    totalArea: result.projects.reduce((sum, p) => sum + (p.area || 0), 0)
                };
                setStats(newStats);
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

    if (!isOpen) return null;

    return (
        <div className="my-projects-modal-overlay" onClick={onClose}>
            <div className="my-projects-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="my-projects-modal-close" onClick={onClose}>✕</button>
                
                <div className="my-projects-modal-header">
                    <div className="header-icon">
                        <Icons.Folder size={32} color="#3a5a6a" />
                    </div>
                    <Typography variant="h3" color="dark" weight="bold">
                        Мои проекты
                    </Typography>
                    <Typography variant="small" color="primary">
                        Проекты, над которыми я работал(а)
                    </Typography>
                </div>

                {/* Статистика */}
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
        <div className="stat-value">
            {typeof stats.totalArea === 'number' 
                ? stats.totalArea.toFixed(0) 
                : Number(stats.totalArea || 0).toFixed(0)}
        </div>
        <div className="stat-label">Общая площадь, м²</div>
        <div className="stat-icon">📐</div>
    </div>
</div>

                {/* Список проектов */}
                <div className="my-projects-modal-content">
                    {isLoading ? (
                        <div className="loading-projects">
                            <div className="spinner"></div>
                            <Typography color="primary">Загрузка проектов...</Typography>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="no-projects">
                            <Icons.Folder size={48} color="#ccc" />
                            <Typography variant="body" color="secondary">
                                У вас пока нет проектов
                            </Typography>
                        </div>
                    ) : (
                        <div className="projects-grid">
                            {projects.map(project => (
                                <div 
                                    key={project.id} 
                                    className="project-card"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <div className="project-image">
                                        {project.main_image ? (
                                            <img 
                                                src={project.main_image ? project.main_image : '/placeholder-project.jpg'}
                                                alt={project.title}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-project.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="no-image">
                                                <Icons.Image size={32} color="#ccc" />
                                            </div>
                                        )}
                                        <div className={getStatusClass(project.status)}>
                                            {getStatusText(project.status)}
                                        </div>
                                    </div>
                                    <div className="project-info">
                                        <h4 className="project-title">{project.title}</h4>
                                        <div className="project-details">
    {project.location && (
        <div className="project-detail">
            <Icons.MapPin size={14} color="#6c8a9a" />
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
            <Icons.Ruler size={14} color="#6c8a9a" />
            <span>{Number(project.area).toFixed(0)} м²</span>
        </div>
    )}
    {project.team_role && (
        <div className="project-detail role">
            <Icons.User size={14} color="#6c8a9a" />
            <span>Роль: {project.team_role}</span>
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

                {/* Модальное окно с деталями проекта */}
                {selectedProject && (
                    <div className="project-detail-modal-overlay" onClick={() => setSelectedProject(null)}>
                        <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="detail-modal-close" onClick={() => setSelectedProject(null)}>✕</button>
                            
                            <div className="detail-modal-image">
                                {selectedProject.main_image ? (
                                    <img 
                                        src={selectedProject.main_image ? selectedProject.main_image : '/placeholder-project.jpg'}
                                        alt={selectedProject.title}
                                    />
                                ) : (
                                    <div className="no-image-large">
                                        <Icons.Image size={64} color="#ccc" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="detail-modal-content">
                                <Typography variant="h4" weight="bold" color="dark">
                                    {selectedProject.title}
                                </Typography>
                                <div className="detail-modal-info">
    <div className="detail-info-item">
        <Icons.MapPin size={16} color="#3a5a6a" />
        <span>{selectedProject.location || 'Локация не указана'}</span>
    </div>
    <div className="detail-info-item">
        <Icons.Calendar size={16} color="#3a5a6a" />
        <span>{selectedProject.project_year || 'Год не указан'}</span>
    </div>
    <div className="detail-info-item">
        <Icons.Ruler size={16} color="#3a5a6a" />
        <span>{selectedProject.area ? `${Number(selectedProject.area).toFixed(0)} м²` : '0 м²'}</span>
    </div>
    <div className="detail-info-item">
        <div className={getStatusClass(selectedProject.status)}>
            {getStatusText(selectedProject.status)}
        </div>
    </div>
    {selectedProject.team_role && (
        <div className="detail-info-item role-highlight">
            <Icons.User size={16} color="#3a5a6a" />
            <span><strong>Моя роль:</strong> {selectedProject.team_role}</span>
        </div>
    )}
</div>
                                {selectedProject.description && (
                                    <div className="detail-modal-description">
                                        <Typography variant="body" weight="bold">Описание проекта:</Typography>
                                        <Typography variant="body" color="secondary">
                                            {selectedProject.description}
                                        </Typography>
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

export default MyProjectsModal;
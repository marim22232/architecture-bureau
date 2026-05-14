import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Typography from '../Typography/Typography.jsx';
import { getAllProjects } from '../../../services/api';
import MyButton from '../MyButton/MyButton.jsx';
import './ProjectsSlider.css';

const ProjectsSlider = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await getAllProjects({ status: 'built' }, 1, 6);
                
                console.log('API Response:', response);
                
                // Так как response имеет структуру { success: true, projects: [...] }
                let projectsArray = [];
                if (response && response.success && response.projects) {
                    projectsArray = response.projects;
                } else if (response && response.projects) {
                    projectsArray = response.projects;
                } else if (Array.isArray(response)) {
                    projectsArray = response;
                }
                
                console.log('Projects loaded:', projectsArray.length);
                setProjects(projectsArray);
                setError(null);
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setError(err.message || 'Не удалось загрузить проекты');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProjects();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/placeholder.svg';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    if (loading) {
        return (
            <div className="projects-loader">
                <div className="loader"></div>
                <Typography variant="body" color="primary">Загрузка проектов...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div className="projects-error">
                <Typography variant="body" color="primary">{error}</Typography>
                <MyButton onClick={() => window.location.reload()} className="retry-btn">
                    Попробовать снова
                </MyButton>
            </div>
        );
    }

    if (!projects || projects.length === 0) {
        return (
            <div className="projects-empty">
                <Typography variant="body" color="primary">Проекты пока не добавлены</Typography>
            </div>
        );
    }

    return (
        <div className="projects-slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={projects.length > 1}
                breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                className="projects-swiper"
            >
                {projects.map((project) => (
                    <SwiperSlide key={project.id}>
                        <div className="project-slide">
                            <div className="project-image">
                                <img 
                                    src={getImageUrl(project.main_image)}
                                    alt={project.title || 'Проект'}
                                    onError={(e) => {
                                        e.target.src = '/images/placeholder.svg';
                                    }}
                                />
                                <div className="project-overlay">
                                    <span className="project-category">
                                        {project.project_type_name || 'Проект'}
                                    </span>
                                </div>
                            </div>
                            <div className="project-info">
                                <Typography variant="h4" color="dark" weight="semibold">
                                    {project.title?.trim() || 'Без названия'}
                                </Typography>
                                <Typography variant="small" color="primary">
                                    {project.location?.trim() || 'Локация не указана'}
                                    {project.project_year ? `, ${project.project_year}` : ''}
                                </Typography>
                                <Typography variant="body" color="primary" className="project-description">
                                    {project.description 
                                        ? project.description.substring(0, 100) + (project.description.length > 100 ? '...' : '')
                                        : 'Описание проекта'}
                                </Typography>
                                {project.area && (
                                    <div className="project-features">
                                        <span className="feature-tag">Площадь: {project.area} м²</span>
                                    </div>
                                )}
                                <a href={`/projects/${project.slug}`} className="project-link">
                                    Подробнее →
                                </a>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProjectsSlider;
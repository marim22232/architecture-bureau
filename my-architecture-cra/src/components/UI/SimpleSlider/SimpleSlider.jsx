import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../../services/api';
import placeholderImg from '../../../assets/images/placeholder.svg'; // Импортируем локальное изображение
import './SimpleSlider.css';

const SimpleSlider = () => {
    const [projects, setProjects] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await getAllProjects({ status: 'built' }, 1, 10);
            
            console.log('SimpleSlider response:', response);
            
            let projectsArray = [];
            if (response && response.success && response.projects) {
                projectsArray = response.projects;
            } else if (response && response.projects) {
                projectsArray = response.projects;
            }
            
            setProjects(projectsArray);
        } catch (err) {
            console.error('Error loading projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % projects.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
    };

    const getImageUrl = (imagePath) => {
    if (!imagePath) return placeholderImg;
    // Если уже полный URL (начинается с http), возвращаем как есть
    if (imagePath.startsWith('http')) return imagePath;
    // Если начинается с /uploads, добавляем базовый URL API
    if (imagePath.startsWith('/uploads')) {
        return `https://my-architecture-api.onrender.com${imagePath}`;
    }
    return placeholderImg;
};

    if (loading) {
        return (
            <div className="simple-slider-loader">
                <div className="loader-spinner"></div>
                <p>Загрузка проектов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="simple-slider-error">
                <p>Ошибка: {error}</p>
                <button onClick={fetchProjects}>Повторить</button>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="simple-slider-empty">
                <p>Проекты пока не добавлены</p>
            </div>
        );
    }

    // Для отображения 3 слайдов одновременно
    const getVisibleSlides = () => {
        const slides = [];
        const total = projects.length;
        
        for (let i = -1; i <= 1; i++) {
            let index = (currentSlide + i + total) % total;
            let position = i === 0 ? 'center' : (i === -1 ? 'left' : 'right');
            slides.push({ ...projects[index], position, originalIndex: index });
        }
        return slides;
    };

    const visibleSlides = getVisibleSlides();

    return (
        <div className="simple-slider">
            <div className="simple-slider-container">
                <button className="slider-nav prev" onClick={prevSlide}>
                    ‹
                </button>
                
                <div className="slider-track">
                    {visibleSlides.map((project, idx) => (
                        <div 
                            key={`${project.id}-${idx}`} 
                            className={`slider-card ${project.position}`}
                        >
                            <div className="card-inner">
                                <div className="card-image">
                                    <img 
                                        src={getImageUrl(project.main_image || project.cover_image)} 
                                        alt={project.title}
                                        onError={(e) => {
                                            e.target.onerror = null; // Предотвращаем зацикливание
                                            e.target.src = placeholderImg;
                                        }}
                                    />
                                    <div className="card-badge">
                                        {project.project_type_name || 'Проект'}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{project.title?.trim()}</h3>
                                    <p className="card-location">
                                        📍 {project.location?.trim()}
                                    </p>
                                    <p className="card-year">
                                        📅 {project.project_year}
                                    </p>
                                    <p className="card-area">
                                        📐 {project.area} м²
                                    </p>
                                    <Link to={`/projects/${project.slug}`} className="card-link">
                                        Подробнее →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button className="slider-nav next" onClick={nextSlide}>
                    ›
                </button>
            </div>
            
            <div className="slider-dots">
                {projects.map((_, idx) => (
                    <button
                        key={idx}
                        className={`dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SimpleSlider;
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProjects, getProjectTypes } from '../../services/api';
import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import './ProjectsPage.css';
import { getImageUrl } from '../../utils/imageUtils.js';
import Icons from '../../components/UI/Icons/Icons.jsx';
import Loader from '../../components/UI/Loader/Loader.jsx';
const ProjectsPage = () => {
    // ========== СОСТОЯНИЯ ==========
    const [projects, setProjects] = useState([]);      // Список проектов
    const [types, setTypes] = useState([]);            // Типы проектов
    const [loading, setLoading] = useState(true);      // Состояние загрузки
    const [searchParams, setSearchParams] = useSearchParams(); // URL параметры
    // Добавьте в раздел состояний (после других filters)
    //const [sortBy, setSortBy] = useState('date_desc');
    // В initialState для сортировки, рядом с filters:
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_desc');
    // Состояние пагинации
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Состояние фильтров (инициализация из URL)
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        year: searchParams.get('year') || '',
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || 'built'
    });

    // ========== ЗАГРУЗКА ДАННЫХ ==========
    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);

            // Параллельные запросы: проекты и типы проектов
            const [projectsRes, typesRes] = await Promise.all([
                getAllProjects(filters, pagination.page, pagination.limit, sortBy), // добавили sortBy
                getProjectTypes()
            ]);


            // Обработка ответа (поддержка разных форматов)
            setProjects(projectsRes.projects || projectsRes.data || []);
            setPagination(prev => ({
                ...prev,
                total: projectsRes.pagination?.total || 0,
                pages: projectsRes.pagination?.pages || 0
            }));
            setTypes(typesRes.data || typesRes || []);

        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit, sortBy]);
    // Эффект для загрузки при изменении фильтров или страницы
    useEffect(() => {
        fetchProjects();
        // Обновляем URL при изменении фильтров
        const params = {};
        if (filters.type) params.type = filters.type;
        if (filters.year) params.year = filters.year;
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (pagination.page > 1) params.page = pagination.page;
        if (sortBy !== 'date_desc') params.sort = sortBy; // добавлено
        setSearchParams(params);
    }, [filters, pagination.page, sortBy, fetchProjects, setSearchParams]); // добавили sortBy
    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

    // Изменение фильтра
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Сброс на первую страницу
    };
    // Добавьте эту функцию рядом с другими handle-функциями
    const handleSortChange = (value) => {
        setSortBy(value);
        setPagination(prev => ({ ...prev, page: 1 })); // Сброс на первую страницу
    };

    // Сброс всех фильтров
    const handleResetFilters = () => {
    setFilters({
        type: '',
        year: '',
        search: '',
        status: 'built'
    });
    setSortBy('date_desc'); // сброс сортировки
    setPagination(prev => ({ ...prev, page: 1 }));
};

    // Изменение страницы
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

    // Генерация годов для фильтра (последние 10 лет)
    const getYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            years.push(i);
        }
        return years;
    };

    // ========== РЕНДЕРИНГ ==========

    // Состояние загрузки
    if (loading) {
        return (
            <div className="projects-page-loader">
                <Loader type="spinner" size="large" text="Загрузка проектов..." />
            </div>
        );
    }

    return (
        <div className="projects-page">

            {/* ========== HERO СЕКЦИЯ ========== */}
            <section className="projects-hero">
                <div className="container">
                    <Typography variant="h1" color="white" weight="bold">
                        Наши проекты
                    </Typography>
                    <Typography variant="body" color="white" align="center">
                        Более {pagination.total} реализованных проектов по всему миру
                    </Typography>
                </div>
            </section>

            {/* ========== БЛОК ФИЛЬТРОВ ========== */}
            <section className="projects-filters">
                <div className="container">
                    <div className="filters-wrapper">

                        {/* Поиск */}
                        <div className="filter-group search-group">
                            <Icons.Search size={18} color="gray" />
                            <input
                                type="text"
                                placeholder="Поиск по названию..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="filter-search"
                            />
                            {filters.search && (
                                <button
                                    className="filter-clear"
                                    onClick={() => handleFilterChange('search', '')}
                                >
                                    <Icons.Close size={14} />
                                </button>
                            )}
                        </div>

                        {/* Фильтр по типу проекта */}
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все типы проектов</option>
                            {types.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>

                        {/* Фильтр по году */}
                        <select
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все года</option>
                            {getYears().map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        {/* Фильтр по статусу */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="filter-select"
                        >
                            <option value="built">Построенные</option>
                            <option value="in_progress">В процессе</option>
                            <option value="design">На стадии проекта</option>
                        </select>

                        {/* Кнопка сброса фильтров */}
                        {(filters.type || filters.year || filters.search || filters.status !== 'built') && (
                            <button
                                onClick={handleResetFilters}
                                className="filter-reset"
                                aria-label="Сбросить фильтры"
                            >
                                <Icons.Close size={14} />
                                Сбросить все
                            </button>
                        )}
                    </div>

                    {/* Активные фильтры (чипы) */}
                    <div className="active-filters">
                        {filters.type && types.find(t => t.id === parseInt(filters.type)) && (
                            <span className="filter-chip">
                                Тип: {types.find(t => t.id === parseInt(filters.type))?.name}
                                <button onClick={() => handleFilterChange('type', '')}>×</button>
                            </span>
                        )}
                        {filters.year && (
                            <span className="filter-chip">
                                Год: {filters.year}
                                <button onClick={() => handleFilterChange('year', '')}>×</button>
                            </span>
                        )}
                        {filters.search && (
                            <span className="filter-chip">
                                Поиск: {filters.search}
                                <button onClick={() => handleFilterChange('search', '')}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ========== СЕТКА ПРОЕКТОВ ========== */}
            <section className="projects-grid-section">
                <div className="container">

                    {/* Информация о количестве */}
                    <div className="projects-header">
                        <div className="projects-count">
                            <Icons.Folder size={16} />
                            <Typography variant="small" color="gray">
                                Найдено проектов: <strong>{pagination.total}</strong>
                            </Typography>
                        </div>

                        {/* Сортировка (опционально) */}
                        <div className="projects-sort">
                            <span className="sort-label">Сортировать:</span>
                            <select
                                className="sort-select"
                                value={sortBy}  // добавлено value
                                onChange={(e) => handleSortChange(e.target.value)}  // исправлено
                            >
                                <option value="date_desc">Сначала новые</option>
                                <option value="date_asc">Сначала старые</option>
                                <option value="title_asc">По названию (А-Я)</option>
                                <option value="title_desc">По названию (Я-А)</option>
                                <option value="area_desc">По площади (убыв.)</option>
                                <option value="area_asc">По площади (возр.)</option>
                            </select>
                        </div>
                    </div>

                    {/* Сетка карточек */}
                    {projects.length === 0 ? (
                        <div className="no-projects">
                            <Icons.Folder size={64} color="gray" />
                            <Typography variant="h3">Проекты не найдены</Typography>
                            <Typography variant="body" color="gray">
                                Попробуйте изменить параметры поиска или сбросить фильтры
                            </Typography>
                            <MyButton onClick={handleResetFilters} className="reset-btn">
                                Сбросить фильтры
                            </MyButton>
                        </div>
                    ) : (
                        <>
                            <div className="projects-grid">
                                {projects.map(project => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>

                            {/* Пагинация */}
                            {pagination.pages > 1 && (
                                <div className="projects-pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="pagination-btn prev"
                                        aria-label="Предыдущая страница"
                                    >
                                        <Icons.ChevronLeft size={20} />
                                        Назад
                                    </button>

                                    <div className="pagination-pages">
                                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.pages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                pageNum = pagination.pages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`pagination-page ${pagination.page === pageNum ? 'active' : ''}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="pagination-btn next"
                                        aria-label="Следующая страница"
                                    >
                                        Вперед
                                        <Icons.ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

// ========== КОМПОНЕНТ КАРТОЧКИ ПРОЕКТА ==========
const ProjectCard = ({ project }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Link to={`/projects/${project.slug}`} className="project-card">
            <div className="project-image-wrapper">
                {!imageLoaded && (
                    <div className="image-placeholder">
                        <Loader type="spinner" size="small" />
                    </div>
                )}
                <img
    src={getImageUrl(project.main_image)}  // ← ИСПРАВЛЕНО
    alt={project.title}
    className={`project-image ${imageLoaded ? 'loaded' : ''}`}
    onLoad={() => setImageLoaded(true)}
    loading="lazy"
/>
                <div className="project-overlay">
                    <div className="overlay-content">
                        <Typography variant="small" color="white" className="overlay-year">
                            {project.project_year}
                        </Typography>
                        <MyButton variant="outline" size="small">
                            Смотреть проект
                        </MyButton>
                    </div>
                </div>
            </div>

            <div className="project-info">
                <Typography variant="h4" weight="semibold" className="project-title">
                    {project.title}
                </Typography>

                <div className="project-location">
                    <Icons.Location size={14} color="gray" />
                    <Typography variant="small" color="gray">
                        {project.location}
                    </Typography>
                </div>

                <div className="project-stats">
                    <div className="project-stat">
                        <Icons.Ruler size={14} color="accent" />
                        <span>{project.area} м²</span>
                    </div>
                    <div className="project-stat">
                        <Icons.Calendar size={14} color="accent" />
                        <span>{project.project_year}</span>
                    </div>
                </div>

                <div className="project-badge">
                    {project.status === 'built' ? (
                        <span className="badge built">✓ Построен</span>
                    ) : (
                        <span className="badge progress">🔄 В процессе</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProjectsPage;
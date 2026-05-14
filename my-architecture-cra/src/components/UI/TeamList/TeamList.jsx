import React, { useState, useEffect } from 'react';
import './TeamList.css';
import Typography from '../../UI/Typography/Typography.jsx';
import { getActiveTeam } from '../../../services/api';

const TeamList = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSpecialization, setSelectedSpecialization] = useState('all');

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                setLoading(true);
                const data = await getActiveTeam();
                setTeam(data);
                setError(null);
            } catch (err) {
                console.error('Ошибка загрузки команды:', err);
                setError('Не удалось загрузить список сотрудников');
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    // Получаем уникальные специализации для фильтрации
    const specializations = ['all', ...new Set(team.map(member => member.specialization).filter(Boolean))];

    // Фильтрация по специализации
    const filteredTeam = selectedSpecialization === 'all' 
        ? team 
        : team.filter(member => member.specialization === selectedSpecialization);

    if (loading) {
        return (
            <div className="team-loading">
                <div className="spinner"></div>
                <Typography variant="body" color="primary">Загрузка команды...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div className="team-error">
                <Typography variant="body" color="primary">{error}</Typography>
                <button onClick={() => window.location.reload()} className="retry-btn">
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (team.length === 0) {
        return (
            <div className="team-empty">
                <Typography variant="body" color="primary">
                    Сотрудники пока не добавлены
                </Typography>
            </div>
        );
    }

    return (
        <div className="team-list-container">
            {/* Фильтр по специализации */}
            {specializations.length > 1 && (
                <div className="team-filters">
                    {specializations.map(spec => (
                        <button
                            key={spec}
                            className={`filter-btn ${selectedSpecialization === spec ? 'active' : ''}`}
                            onClick={() => setSelectedSpecialization(spec)}
                        >
                            {spec === 'all' ? 'Все специалисты' : spec}
                        </button>
                    ))}
                </div>
            )}

            {/* Сетка сотрудников */}
            <div className="team-grid">
                {filteredTeam.map((member) => (
                    <div key={member.id} className="team-card">
                        <div className="team-photo">
                            {member.photo ? (
                                <img 
                                    src={`http://localhost:5000${member.photo}`} 
                                    alt={member.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/300x300/A08972/FFFFFF?text=Фото';
                                    }}
                                />
                            ) : (
                                <div className="photo-placeholder">
                                    <span>👤</span>
                                </div>
                            )}
                            {member.team_lead && (
                                <div className="team-lead-badge">
                                    <span>⭐</span> Руководитель
                                </div>
                            )}
                        </div>
                        
                        <div className="team-info">
                            <Typography variant="h4" color="dark" weight="bold" className="team-name">
                                {member.name}
                            </Typography>
                            <Typography variant="small" color="accent" weight="semibold" className="team-position">
                                {member.position}
                            </Typography>
                            <Typography variant="small" color="primary" className="team-specialization">
                                {member.specialization}
                            </Typography>
                            {member.bio && (
                                <Typography variant="body" color="primary" className="team-bio">
                                    {member.bio.length > 100 ? `${member.bio.substring(0, 100)}...` : member.bio}
                                </Typography>
                            )}
                            <div className="team-stats">
                                {member.experience_years > 0 && (
                                    <span className="stat-badge">📅 {member.experience_years} лет опыта</span>
                                )}
                                {member.projects_count > 0 && (
                                    <span className="stat-badge">🏗️ {member.projects_count} проектов</span>
                                )}
                                {member.rating && (
                                    <span className="stat-badge">⭐ {member.rating}</span>
                                )}
                            </div>
                            <div className="team-contacts">
                                {member.email && (
                                    <a href={`mailto:${member.email}`} className="contact-link" title={member.email}>
                                        📧
                                    </a>
                                )}
                                {member.phone && (
                                    <a href={`tel:${member.phone}`} className="contact-link" title={member.phone}>
                                        📞
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Статистика */}
            <div className="team-stats-footer">
                <Typography variant="small" color="primary">
                    Всего специалистов: {filteredTeam.length}
                </Typography>
            </div>
        </div>
    );
};

export default TeamList;
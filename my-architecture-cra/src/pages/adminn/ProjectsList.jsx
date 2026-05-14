// pages/admin/ProjectsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../services/api';
import Typography from '../../components/UI/Typography/Typography';
import MyButton from '../../components/UI/MyButton/MyButton';

const ProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            // ⭐ Передаем пустой объект как filters
            const res = await getAllProjects({});
            console.log('Загруженные проекты:', res);
            
            // Обрабатываем разные форматы ответа
            if (res.success !== false) {
                const projectsData = res.projects || res.data || (Array.isArray(res) ? res : []);
                setProjects(projectsData);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить проект?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    alert('Проект удален');
                    loadProjects();
                }
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    };

    if (loading) return <Typography variant="body">Загрузка...</Typography>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Typography variant="h2">Управление проектами</Typography>
                <Link to="/admin/create">
                    <MyButton variant="primary">+ Новый проект</MyButton>
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {projects.length === 0 ? (
                    <Typography variant="body" color="default">Нет проектов. Создайте первый проект.</Typography>
                ) : (
                    projects.map(project => (
                        <div key={project.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '16px',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <div>
                                <Typography variant="h4" weight="bold">{project.title}</Typography>
                                <Typography variant="small" color="default">slug: {project.slug}</Typography>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link to={`/admin/edit/${project.id}`}>
                                    <MyButton variant="outline">✏️ Редактировать</MyButton>
                                </Link>
                                <MyButton variant="outline" onClick={() => handleDelete(project.id)} style={{ color: 'red' }}>
                                    🗑️ Удалить
                                </MyButton>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsList;
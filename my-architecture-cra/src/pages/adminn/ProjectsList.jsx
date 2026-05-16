// pages/admin/ProjectsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../services/api';
import Typography from '../../components/UI/Typography/Typography';
import MyButton from '../../components/UI/MyButton/MyButton';
import ConfirmModal from '../../components/UI/ConfirmModal/ConfirmModal';
import Icons from '../../components/UI/Icons/Icons.jsx'; // ✅ Добавить импорт иконок
import { useModal } from '../../hooks/useModal';

const ProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
    const { showAlert, AlertModalComponent } = useModal();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const res = await getAllProjects({});
            console.log('Загруженные проекты:', res);

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

    const handleDeleteClick = (id) => {
        setConfirmModal({ show: true, id });
    };

    const handleConfirmDelete = async () => {
        const id = confirmModal.id;
        setConfirmModal({ show: false, id: null });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showAlert('Проект удален');
                loadProjects();
            } else {
                showAlert('Ошибка при удалении проекта');
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showAlert('Ошибка при удалении проекта');
        }
    };

    if (loading) return <Typography variant="body">Загрузка...</Typography>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Typography variant="h2">
                    Управление проектами
                </Typography>
                <Link to="/admin/create">
                    <MyButton variant="primary">
                        <Icons.Plus size={18} style={{ marginRight: '8px' }} /> Новый проект
                    </MyButton>
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
                        <Icons.Folder size={48} color="#ccc" />
                        <Typography variant="body" color="default" style={{ marginTop: '16px' }}>
                            Нет проектов. Создайте первый проект.
                        </Typography>
                    </div>
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
                                <Typography variant="h4" weight="bold">
                                    {project.title}
                                </Typography>
                                <Typography variant="small" color="default">
                                    slug: {project.slug}
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link to={`/admin/edit/${project.id}`}>
                                    <MyButton variant="outline">
                                        <Icons.Edit size={16} style={{ marginRight: '6px' }} /> Редактировать
                                    </MyButton>
                                </Link>
                                <MyButton 
                                    variant="outline" 
                                    onClick={() => handleDeleteClick(project.id)} 
                                    style={{ color: '#1F2428', borderColor: '#1F2428' }}
                                >
                                    <Icons.Trash size={16} style={{ marginRight: '6px' }} /> Удалить
                                </MyButton>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.show}
                onClose={() => setConfirmModal({ show: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Подтверждение удаления"
                message={`Вы уверены, что хотите удалить проект "${projects.find(p => p.id === confirmModal.id)?.title || ''}"?`}
            />
            <AlertModalComponent />
        </div>
    );
};

export default ProjectsList;
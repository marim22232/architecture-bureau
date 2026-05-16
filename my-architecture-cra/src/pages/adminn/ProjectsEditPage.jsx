// pages/admin/ProjectsEditPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';
import { useModal } from '../../hooks/useModal'; // ✅ Добавить

const ProjectsEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert, AlertModalComponent } = useModal(); // ✅ Добавить
    
    const handleSaved = (project) => {
        console.log('Проект обновлен:', project);
        showAlert('Проект успешно обновлен!'); // ✅ вместо alert
        navigate('/admin');
    };
    
    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px' }}>
            <ProjectForm projectId={id} onSaved={handleSaved} />
            <AlertModalComponent /> {/* ✅ Добавить */}
        </div>
    );
};

export default ProjectsEditPage;
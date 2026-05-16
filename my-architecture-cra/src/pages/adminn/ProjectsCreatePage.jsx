// src/pages/adminn/ProjectsCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';
import { useModal } from '../../hooks/useModal'; // ✅ Добавить

const ProjectsCreatePage = () => {
    const navigate = useNavigate();
    const { showAlert, AlertModalComponent } = useModal(); // ✅ Добавить
    
    const handleSaved = (project) => {
        console.log('Проект создан:', project);
        showAlert('Проект успешно создан!'); // ✅ вместо alert
        navigate('/admin');
    };
    
    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px' }}>
            <ProjectForm onSaved={handleSaved} />
            <AlertModalComponent /> {/* ✅ Добавить */}
        </div>
    );
};

export default ProjectsCreatePage;
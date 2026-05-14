// pages/admin/ProjectsEditPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';

const ProjectsEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const handleSaved = (project) => {
        console.log('Проект обновлен:', project);
        alert('Проект успешно обновлен!');
        navigate('/admin');
    };
    
    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px' }}>
            <ProjectForm projectId={id} onSaved={handleSaved} />
        </div>
    );
};

export default ProjectsEditPage;
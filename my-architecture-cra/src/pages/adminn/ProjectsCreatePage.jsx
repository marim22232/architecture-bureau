// src/pages/adminn/ProjectsCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';

const ProjectsCreatePage = () => {
    const navigate = useNavigate();
    
    const handleSaved = (project) => {
        console.log('Проект создан:', project);
        navigate('/admin');
    };
    
    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px' }}>
            <ProjectForm onSaved={handleSaved} />
        </div>
    );
};

export default ProjectsCreatePage;
import React from 'react';
import './Projects.css';
import Typography from '../../UI/Typography/Typography.jsx';
import ProjectsSlider from '../../UI/ProjectsSlider/ProjectsSlider.jsx';
import SimpleSlider from '../../UI/SimpleSlider/SimpleSlider.jsx';

const Projects = () => {
  return (
    <section className="projects">
      <div className="container-inner">
        <Typography color='accent' variant="h2" align="center" weight="bold">
          Наши проекты
        </Typography>
        <SimpleSlider />
      </div>
    </section>
  );
};

export default Projects;
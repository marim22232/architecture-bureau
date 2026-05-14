import React from 'react';
import './WorldProjects.css';
import Typography from '../../UI/Typography/Typography.jsx';
import WorldMap from '../../UI/WorldMap/WorldMap.jsx';

const WorldProjects = () => {
  return (
    <section className="world-projects">
      <div className="container-inner">
        <Typography variant="h2" align="center" color="accent" weight="bold">
          Мы проектируем по всему миру!
        </Typography>
        <Typography variant="body" align="center" color="primary" style={{ marginBottom: '3rem' }}>
          Наши проекты реализованы в разных уголках планеты
        </Typography>
        <WorldMap />
      </div>
    </section>
  );
};

export default WorldProjects;
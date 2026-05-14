import React from 'react';
import './Hero.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton.jsx';
import pages from '../../../assets/images/pages1.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-image">
        <img src={pages} alt="Архитектурное бюро" />
      </div>
      <div className="hero-content">
        <Typography variant="h1" color="white" align="center">
          Архитектурное бюро M&Y
        </Typography>
        <Typography variant="body" color="white" align="center" as="div">
          Создаем уникальные архитектурные решения с 2010 года. Воплощаем мечты в реальность.
        </Typography>
      </div>
    </section>
  );
};

export default Hero;
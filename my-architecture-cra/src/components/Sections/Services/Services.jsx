import React from 'react';
import Typography from '../../UI/Typography/Typography.jsx';
import ServicesSlider from '../../UI/ServicesSlider/ServicesSlider.jsx'

const Services = () => {
  return (
    <section id="services" className="services"> 
      <div className="container-inner">
        <Typography weight="bold" style={{ margin: 15 }} variant="h2" align="center" color="accent">
          Наши возможности
        </Typography>
        <ServicesSlider />  
      </div>
    </section>
  );
};

export default Services;
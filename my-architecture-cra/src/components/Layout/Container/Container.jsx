import React from 'react';
import Hero from '../../Sections/Hero/Hero.jsx';
import About from '../../Sections/About/About.jsx';
import Architecture from '../../Sections/Architecture/Architecture.jsx';
import Services from '../../Sections/Services/Services.jsx';
import Projects from '../../Sections/Projects/Projects.jsx';
import WorldProjects from '../../Sections/WorldProjects/WorldProjects.jsx';
import Contact from '../../Sections/Contact/Contact.jsx';

const Container = () => {
  return (
    <div className="container">
      <Hero />
      <About />
      <Architecture />
      <Services />
      <Projects />
      <WorldProjects />
      <Contact />
    </div>
  );
};

export default Container;
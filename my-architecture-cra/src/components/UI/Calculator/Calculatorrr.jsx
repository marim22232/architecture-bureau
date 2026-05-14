import React, { useState } from 'react';
import './Calculatorrr.css';
import Typography from '../Typography/Typography.jsx';
import ArchitectureCalculator from './ArchitectureCalculator.jsx';
import InteriorCalculator from './InteriorCalculator.jsx';
import MyButton from '../MyButton/MyButton.jsx';

const Calculatorrr = () => {
  const [mode, setMode] = useState(null); // null, 'architecture', 'interior'

  if (!mode) {
    return (
      <div className="calculator-mode-selector">
        <Typography variant="h2" align="center" color="dark" weight="bold">
          Что хотите рассчитать?
        </Typography>
        <div className="mode-buttons">
          <MyButton 
            className="mode-button"
            onClick={() => setMode('architecture')}
          >
            <span className="mode-icon">🏛️</span>
            <span className="mode-title">Архитектурный проект</span>
            <span className="mode-desc">Проектирование дома, коттеджа, здания</span>
          </MyButton>
          <MyButton 
            className="mode-button"
            onClick={() => setMode('interior')}
          >
            <span className="mode-icon">🪑</span>
            <span className="mode-title">Дизайн интерьера</span>
            <span className="mode-desc">Квартиры, дома, коммерческие помещения</span>
          </MyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator-container">
      {mode === 'architecture' && (
        <ArchitectureCalculator onBack={() => setMode(null)} />
      )}
      {mode === 'interior' && (
        <InteriorCalculator onBack={() => setMode(null)} />
      )}
    </div>
  );
};

export default Calculatorrr;
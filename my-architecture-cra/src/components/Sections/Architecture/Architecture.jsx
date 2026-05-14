import React from 'react';
import './Architecture.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButtonOutline from '../../UI/MyButtonOutline/MyButtonOutline.jsx';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import animation from '../../../assets/images/animation.gif';

const Architecture = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="architecture">
      <div className="container-inner">
        <div className="architecture-header">
          <Typography variant="h2" align="center" color="accent" weight="bold" className="architecture-title">
            АРХИТЕКТУРА ВНЕ ВРЕМЕНИ
          </Typography>
          <Typography variant="body" align="center" color="primary" className="architecture-subtitle">
            Создаём пространства, которые вдохновляют и служат поколениям
          </Typography>
        </div>

        <div className="architecture-content">
          <div className="two-columns">
            {/* Левая колонка */}
            <div className="left-column">
              <div className="gif-container">
                <img src={animation} alt="Архитектурная анимация" />
              </div>

              <div className="stats" ref={ref}>
                <div className="stat-item">
                  <Typography variant="h1" color="accent" weight="bold" className="stat-number">
                    {inView && <CountUp end={50} duration={1.5} suffix="+" />}
                  </Typography>
                  <Typography variant="small" color="primary" className="stat-label">
                    ДОВОЛЬНЫХ <br/> КЛИЕНТОВ
                  </Typography>
                </div>

                <div className="stat-item">
                  <Typography variant="h1" color="accent" weight="bold" className="stat-number">
                    {inView && <CountUp end={200} duration={2} suffix="+" />}
                  </Typography>
                  <Typography variant="small" color="primary" className="stat-label">
                    РЕАЛИЗОВАННЫХ <br/> ПРОЕКТОВ
                  </Typography>
                </div>

                <div className="stat-item">
                  <Typography variant="h1" color="accent" weight="bold" className="stat-number">
                    {inView && <CountUp end={16} duration={1.5} suffix="+" />}
                  </Typography>
                  <Typography variant="small" color="primary" className="stat-label">
                    ЛЕТ <br/> ОПЫТА
                  </Typography>
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="right-column">
              <div className="description-block">
                <Typography variant="h3" align="center" color="accent" weight="semibold">
                  Архитектура в Санкт-Петербурге
                </Typography>
                <Typography variant="body" align="justify" color="primary">
                  Сотрудничая с нами, вы получаете не просто эстетику и безупречное качество,
                  а глубокую проработку каждой детали. Вместе мы воплотим ваше идеальное пространство,
                  превосходя ожидания и превращая мечты в реальность.
                </Typography>
              </div>

              <div className="description-block">
                <Typography variant="h3" align="center" color="accent" weight="semibold">
                  Проект — это лишь отправная точка
                </Typography>
                <Typography variant="body" align="justify" color="primary">
                  Применяя передовые мировые практики в области дизайна и архитектуры,
                  мы создаем не просто здания, а вдохновляющую атмосферу для тех, кто стремится к большему.
                </Typography>
              </div>

              <div className="button-wrapper">
                <MyButtonOutline className="architecture-btn">
                  НАЧНЕМ ПРОЕКТ ВМЕСТЕ!
                </MyButtonOutline>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
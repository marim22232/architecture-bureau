import React from 'react';
import { Link } from 'react-router-dom';
import './AboutCompany.css';
import Typography from '../../components/UI/Typography/Typography.jsx';
import ContactForm from '../../components/UI/ContactForm/ContactForm.jsx';
import MyButtonOutline from '../../components/UI/MyButtonOutline/MyButtonOutline.jsx';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import HistorySlider from '../../components/UI/HistorySlider/HistorySlider.jsx';
import CalculatorStages from '../../components/UI/CalculatorStages/CalculatorStages.jsx';
import TeamList from '../../components/UI/TeamList/TeamList.jsx';

const AboutCompany = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const advantages = [
    {
      id: 1,
      icon: '🚀',
      title: 'Быстрый старт',
      description: 'Выход на проект в течение 3–5 дней после подписания договора.',
    },
    {
      id: 2,
      icon: '🛡️',
      title: 'Надёжность',
      description: 'Работаем с 2018 года, все договоры официально зарегистрированы.',
    },
    {
      id: 3,
      icon: '💡',
      title: 'Экспертиза',
      description: 'Команда из 50+ специалистов в IT, маркетинге и дизайне.',
    },
    {
      id: 4,
      icon: '🌍',
      title: 'Удалённо по всему миру',
      description: 'Сотрудничаем с клиентами из России, СНГ, Европы и Азии.',
    },
  ];

  const values = [
    { id: 1, title: 'Честность', desc: 'Прозрачные условия без скрытых платежей.' },
    { id: 2, title: 'Качество', desc: 'Каждый проект проходит многоуровневое тестирование.' },
    { id: 3, title: 'Развитие', desc: 'Инвестируем в обучение сотрудников и новые технологии.' },
  ];

  return (
    <div className="about-company">
      {/* Hero-секция */}
      <section className="hero">
        <div className="container">
          <div className='left-container'>
            <Typography variant="h2" color="white" weight="bold">
              Архитектурное бюро M&Y
            </Typography>
            <Link to="/office" >
              <MyButtonOutline style={{ width: '420px' }}>Наш офис | Шоурум</MyButtonOutline>
            </Link>
          </div>
          <div className='right-container'>
            <Typography variant="body-large" color="white" className="hero-subtitle">
              Мы создаём цифровые продукты, которые меняют бизнес.
              Надёжность, опыт и инновации — в каждом решении.
            </Typography>
          </div>
        </div>
      </section>

      {/* Миссия и история */}
      <section className="mission" ref={ref}>
        <div className="container">
          <div className="mission-grid">
            <div className="mission-text">
              <span className="section-badge">
                <Typography variant="small" color="primary" weight="bold">
                  Наша философия
                </Typography>
              </span>
              <Typography variant="h2" color="dark" weight="bold">
             M&Y - архитектура будущего, построенная сегодня.
              </Typography>
              <Typography variant="body" color="primary" style={{ marginTop: '1rem' }}>
                Архитектурное Бюро "M&Y": Инновации в каждом проекте
              </Typography>
              <Typography variant="body" color="primary" style={{ marginTop: '1rem' }}>
              Мы — команда инженеров и предпринимателей, объединенных страстью к созданию пространства. В "M&Y" мы сочетаем глубокое понимание облачных технологий, передовую разработку ПО и опыт автоматизации, чтобы предлагать вам не просто проекты, а комплексные, интеллектуальные решения под ключ.

              </Typography>
              <Typography variant="body" color="primary" style={{ marginTop: '1rem' }}>
             Мы верим, что будущее архитектуры — в синергии физического пространства и цифровых инноваций. От первой концепции до финальной реализации, "M&Y" гарантирует точность, эффективность и бескомпромиссное качество.

              </Typography>
            </div>
            <div className="mission-stats">
              <div className="stat-card">
                <Typography variant="h2" color="accent" weight="bold">
                  {inView && <CountUp end={200} duration={1.5} suffix="+" />}
                </Typography>
                <Typography variant="small" color="primary">проектов</Typography>
              </div>
              <div className="stat-card">
                <Typography variant="h2" color="accent" weight="bold">
                  {inView && <CountUp end={50} duration={1.5} suffix="+" />}
                </Typography>
                <Typography variant="small" color="primary">специалистов</Typography>
              </div>
              <div className="stat-card">
                <Typography variant="h2" color="accent" weight="bold">
                  {inView && <CountUp end={98} duration={1.5} suffix="%" />}
                </Typography>
                <Typography variant="small" color="primary">довольных клиентов</Typography>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Слайдер с историей */}
      <HistorySlider />

      {/* Преимущества */}
      <section className="advantages">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <Typography variant="small" color="primary" weight="bold">
                Почему выбирают нас
              </Typography>
            </span>
            <Typography variant="h2" color="dark" weight="bold" align="center">
              Ключевые преимущества
            </Typography>
          </div>
          <div className="advantages-grid">
            {advantages.map((item) => (
              <div key={item.id} className="advantage-card">
                <div className="advantage-icon">{item.icon}</div>
                <Typography variant="h4" color="dark" weight="bold" align="center">
                  {item.title}
                </Typography>
                <Typography variant="body" color="primary" align="center">
                  {item.description}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ценности */}
      <section className="values">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <Typography variant="small" color="primary" weight="bold">
                Принципы работы
              </Typography>
            </span>
            <Typography variant="h2" color="dark" weight="bold" align="center">
              Наши ценности
            </Typography>
          </div>
          <div className="values-grid">
            {values.map((item) => (
              <div key={item.id} className="value-card">
                <Typography variant="h4" color="dark" weight="bold">
                  {item.title}
                </Typography>
                <Typography variant="body" color="primary">
                  {item.desc}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* НОВАЯ СЕКЦИЯ КОМАНДЫ С TeamList */}
      {/* ============================================ */}
      <section className="team-section">
        <div className="container">
          <div className="team-header">
            <span className="section-badge">
              <Typography variant="small" color="primary" weight="bold">
                Наша команда
              </Typography>
            </span>
            <Typography variant="h2" color="dark" weight="bold" align="center">
              Профессионалы своего дела
            </Typography>
            <Typography variant="body" color="primary" align="center" className="team-subtitle">
              В нашей команде — архитекторы, инженеры, дизайнеры и менеджеры. 
              Мы верим в горизонтальное управление и открытую коммуникацию.
            </Typography>
          </div>
          
          {/* Список сотрудников из базы данных */}
          <TeamList />
        </div>
      </section>

      {/* Секция с этапами */}
      <section className="stages">
        <div className="stages-header">
          <Typography variant="h2" align="center" color="dark" weight="bold">
            Как мы работаем
          </Typography>
          <Typography variant="body" align="center" color="primary" className="stages-label">
            Этапы, хронология и порядок выполнения работ над проектом
          </Typography>
        </div>
        <CalculatorStages />
      </section>

      {/* Контактный призыв */}
      <section className="contact-cta">
        <div className="container">
          <ContactForm />
        </div>
      </section>
    </div>
  );
};

export default AboutCompany;
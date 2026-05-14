import React from 'react';
import './Contacts.css';
import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import ContactForm from '../../components/UI/ContactForm/ContactForm.jsx';
import Icons from '../../components/UI/Icons/Icons.jsx'; // ← импорт иконок

const Contacts = () => {
  // Координаты для карты (пример: Москва, ул. Архитекторов, 15)
  const mapUrl = "https://yandex.ru/map-widget/v1/?ll=37.617698,55.755864&z=16&pt=37.617698,55.755864,pmrdl~";

  return (
    <div className="contacts-page">
      {/* Hero секция */}
      <section className="contacts-hero">
        <div className="container">
          <Typography variant="h1" color="white" weight="bold" align="center">
            Контакты
          </Typography>
          <Typography variant="body-large" color="white" align="center" className="hero-description">
            Создаем уникальные архитектурные решения с 2010 года. Воплощаем мечты в реальность.
          </Typography>
        </div>
      </section>

      {/* Основной контент */}
      <section className="contacts-content">
        <div className="container">
          <div className="contacts-grid">
            {/* Левая колонка - информация */}
            <div className="contacts-info">
              <div className="info-card">
                <div className="contact-icon icon-primary">
                  <Icons.Location size={22} />
                </div>
                <Typography variant="h4" color="dark" weight="bold">
                  Адрес
                </Typography>
                <Typography variant="body" color="primary">
                  г. Москва, ул. Архитекторов, 15
                </Typography>
                <Typography variant="small" color="primary" className="work-schedule">
                  Пн-Пт: 9:00 - 20:00<br />
                  Сб-Вс: 10:00 - 18:00
                </Typography>
              </div>

              <div className="info-card">
                <div className="contact-icon icon-primary">
                  <Icons.Phone size={22} />
                </div>
                <Typography variant="h4" color="dark" weight="bold">
                  Телефон
                </Typography>
                <Typography variant="body" color="primary">
                  <a href="tel:+74951234567" className="contact-link">+7(495)123-45-67</a>
                </Typography>
                <Typography variant="small" color="primary" className="work-schedule">
                  Ежедневно с 9:00 до 20:00
                </Typography>
              </div>

              <div className="info-card">
                <div className="contact-icon icon-primary">
                  <Icons.Email size={22} />
                </div>
                <Typography variant="h4" color="dark" weight="bold">
                  Email
                </Typography>
                <Typography variant="body" color="primary">
                  <a href="mailto:info@archstudio.ru" className="contact-link">info@archstudio.ru</a>
                </Typography>
                <Typography variant="small" color="primary">
                  Ответим в течение 24 часов
                </Typography>
              </div>

              <div className="info-card">
                <div className="contact-icon icon-primary">
                  <Icons.Clock size={22} />
                </div>
                <Typography variant="h4" color="dark" weight="bold">
                  Режим работы
                </Typography>
                <Typography variant="body" color="primary">
                  Понедельник - Пятница: 9:00 - 20:00
                </Typography>
                <Typography variant="body" color="primary">
                  Суббота - Воскресенье: 10:00 - 18:00
                </Typography>
              </div>
            </div>

            {/* Правая колонка - карта и форма */}
            <div className="contacts-right">
              {/* Карта */}
              <div className="map-container">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  title="Карта офиса архитектурного бюро"
                />
              </div>

              {/* Форма обратной связи */}
              <div className="feedback-form">
                <form className="contact-form">
                  <ContactForm subtitle="Оставьте заявку и мы свяжемся с вами в ближайшее время" />
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Как добраться */}
      <section className="directions-section">
        <div className="container">
          <Typography variant="h2" color="dark" weight="bold" align="center">
            Как добраться
          </Typography>
          <div className="directions-grid">
            <div className="direction-item">
              <div className="direction-icon icon-accent">
                <Icons.Metro size={20} />
              </div>
              <Typography variant="h4" color="dark" weight="bold">
                Метро
              </Typography>
              <Typography variant="body" color="primary">
                ст. "Архитектурная", выход к ул. Архитекторов, 5 минут пешком
              </Typography>
            </div>
            <div className="direction-item">
              <div className="direction-icon icon-accent">
                <Icons.Bus size={20} />
              </div>
              <Typography variant="h4" color="dark" weight="bold">
                Наземный транспорт
              </Typography>
              <Typography variant="body" color="primary">
                Автобусы №12, 23, 45 до остановки "Улица Архитекторов"
              </Typography>
            </div>
            <div className="direction-item">
              <div className="direction-icon icon-accent">
                <Icons.Car size={20} />
              </div>
              <Typography variant="h4" color="dark" weight="bold">
                На автомобиле
              </Typography>
              <Typography variant="body" color="primary">
                От ТТК съезд на ул. Архитекторов, парковка у офиса
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;
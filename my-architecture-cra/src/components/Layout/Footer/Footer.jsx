import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaTelegram, FaYoutube } from 'react-icons/fa';
import './Footer.css';
import Typography from '../../UI/Typography/Typography.jsx';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logo2.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">

      <div className="footer-content">
        {/* Логотип слева */}

        {/* О компании */}
        <div className="footer-section">
          <div className="logo">
            <a href="/">
              <img src={logo} alt="Логотип компании" />
            </a>
          </div>
          <Typography variant="body" className="footer-text">
            Создаем уникальные архитектурные решения с 2010 года. Воплощаем мечты в реальность.
          </Typography>
          <div className="social-links">
          </div>
        </div>

        {/* Навигация */}
        <div className="footer-section">
          <Typography variant="h3" className="footer-h3">
            Помощь
          </Typography>
          <ul>
            <li>
              <Link to="/company" >
                <Typography variant="body" className="footer-link-text" >О компании</Typography>
              </Link></li>
            <li><a href="/projects"><Typography variant="body" className="footer-link-text">Проекты</Typography></a></li>
            <li><a href="/contacts"><Typography variant="body" className="footer-link-text">Контакты</Typography></a></li>
            <li><a href="/reviews"><Typography variant="body" className="footer-link-text">Отзывы</Typography></a></li>

          </ul>
        </div>



        {/* Контакты */}
        <div className="footer-section">
          <Typography variant="h3" className="footer-h3">
            Контакты
          </Typography>
          <ul className="contacts">
            <li><FaMapMarkerAlt /><Typography variant="body" className="footer-text"> г. Москва, ул. Архитекторов, 15</Typography></li>
            <li><FaPhone /><a href="tel:+74951234567"><Typography variant="body" className="footer-link-text">+7 (495) 123-45-67</Typography></a></li>
            <li><FaEnvelope /><a href="mailto:info@archstudio.ru"><Typography variant="body" className="footer-link-text">info@archstudio.ru</Typography></a></li>
            <li><FaClock /><Typography variant="body" className="footer-text"> Пн-Пт: 9:00 - 20:00</Typography></li>
            <li><FaClock /><Typography variant="body" className="footer-text"> Сб-Вс: 10:00 - 18:00</Typography></li>
          </ul>
        </div>
      </div>

      {/* Нижняя часть */}
      <div className="footer-bottom">
        <Typography variant="small" className="footer-small">
          © {currentYear} Архитектурное бюро. Все права защищены.
        </Typography>
        <div className="footer-links">
          <a href="/privacy"><Typography variant="small" className="footer-link-small">Политика конфиденциальности</Typography></a>
          <a href="/terms"><Typography variant="small" className="footer-link-small">Условия использования</Typography></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
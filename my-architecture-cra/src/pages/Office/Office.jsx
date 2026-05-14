import React from 'react';
import './Office.css';
import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import { Link } from 'react-router-dom';
import Icons from '../../components/UI/Icons/Icons.jsx';
// Импорт фотографий (замените на свои пути)
import officePhoto1 from '../../assets/images/office/1.jpg';
import officePhoto2 from '../../assets/images/office/2.jpg';
import officePhoto3 from '../../assets/images/office/3.jpg';
import officePhoto4 from '../../assets/images/office/4.jpg';

const Office = () => {
    const photos = [
        { id: 1, src: officePhoto1, title: 'Рабочее пространство', description: 'Современный офис с зоной для творчества' },
        { id: 2, src: officePhoto2, title: 'Шоурум материалов', description: 'Более 500 образцов отделочных материалов' },
        { id: 3, src: officePhoto3, title: 'Переговорная', description: 'Комфортная зона для встреч с клиентами' },
        { id: 4, src: officePhoto4, title: 'Выставочный зал', description: 'Готовые решения для вашего интерьера' }
    ];

    return (
        <div className="office-page">
            {/* Hero секция */}
            <section className="office-hero">
                <div className="container">
                    <Typography variant="h1" color="white" weight="bold" align="center">
                        Наш офис | Шоурум
                    </Typography>
                    <Typography variant="body-large" color="white" align="center" className="hero-description">
                        Добро пожаловать в пространство, где рождаются идеи
                    </Typography>
                </div>
            </section>

            {/* Описание */}
            <section className="office-description">
                <div className="container">
                    <div className="description-content">
                        <Typography variant="h2" color="dark" weight="bold" align="center">
                            Пространство для вдохновения
                        </Typography>
                        <Typography variant="body" color="primary" align="center" className="description-text">
                            Наш офис и шоурум — это не просто рабочее место, а настоящая творческая лаборатория.
                            Здесь вы можете познакомиться с нашей командой, увидеть образцы материалов и обсудить
                            ваш будущий проект в комфортной атмосфере.
                        </Typography>
                    </div>
                </div>
            </section>

            {/* Галерея 4 фото */}
            <section className="office-gallery">
                <div className="container">
                    <div className="gallery-grid">
                        {photos.map((photo) => (
                            <div key={photo.id} className="gallery-item">
                                <div className="gallery-image">
                                    <img src={photo.src} alt={photo.title} />
                                    <div className="gallery-overlay">
                                        <Typography variant="h4" color="white" weight="bold">
                                            {photo.title}
                                        </Typography>
                                        <Typography variant="small" color="white">
                                            {photo.description}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Карта и информация */}
            <section className="office-map">
                <div className="container">
                    <Typography variant="h2" color="dark" weight="bold" align="center" >
                        Как нас найти
                    </Typography>

                    <div className="map-info-grid">
                        {/* Левая колонка: Карта */}
                        <div className="map-column">
                            <div className="map-container">
                                <iframe
                                    src="https://yandex.ru/map-widget/v1/?ll=37.617698,55.755864&z=16&pt=37.617698,55.755864,pmrdl~"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Карта офиса"
                                />
                            </div>
                        </div>

                         {/* Правая колонка: Вся информация */}
                        <div className="info-column">
                            {/* Блок с контактами */}
                            <div className="info-contacts">
                                <div className="contact-item">
                                    <div className="contact-icon icon-primary">
                                        <Icons.Clock />
                                    </div>
                                    <div className="contact-text">
                                        <strong>Режим работы:</strong>
                                        <span>Пн-Пт: 9:00 - 20:00</span>
                                        <span>Сб-Вс: 10:00 - 18:00</span>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon icon-primary">
                                        <Icons.Phone />
                                    </div>
                                    <div className="contact-text">
                                        <strong>Телефон:</strong>
                                        <a href="tel:+74951234567" className="info-link">+7 (495) 123-45-67</a>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon icon-primary">
                                        <Icons.Email />
                                    </div>
                                    <div className="contact-text">
                                        <strong>Email:</strong>
                                        <a href="mailto:info@example.ru" className="info-link">info@example.ru</a>
                                    </div>
                                </div>
                            </div>

                              {/* Блок с транспортом */}
                            <div className="directions">
                                <div className="direction">
                                    <div className="direction-icon icon-accent">
                                        <Icons.Metro size={20} />
                                    </div>
                                    <Typography variant="body" color="primary">
                                        <strong>Метро:</strong> ст. "Архитектурная", выход к ул. Архитекторов, 5 минут пешком
                                    </Typography>
                                </div>

                                <div className="direction">
                                    <div className="direction-icon icon-accent">
                                        <Icons.Bus size={20} />
                                    </div>
                                    <Typography variant="body" color="primary">
                                        <strong>Наземный транспорт:</strong> Автобусы №12, 23, 45 до остановки "Улица Архитекторов"
                                    </Typography>
                                </div>

                                <div className="direction">
                                    <div className="direction-icon icon-accent">
                                        <Icons.Car size={20} />
                                    </div>
                                    <Typography variant="body" color="primary">
                                        <strong>На автомобиле:</strong> От ТТК съезд на ул. Архитекторов, парковка у офиса
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Office;
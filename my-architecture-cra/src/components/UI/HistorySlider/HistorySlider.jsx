import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import Typography from '../Typography/Typography';
// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HistorySlider.css';

const HistorySlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef(null);

    const historyData = [
        {
            id: 1,
            year: 2010,
            title: 'Основание бюро',
            description: 'Архитектурное бюро M&Y основано выпускниками МАрхИ. Начинали с небольших частных интерьеров и загородных домов.',
            achievements: ['Первый проект — 120 м²', 'Команда: 3 архитектора'],
            image: '🏛️',
            icon: '🌟'
        },
        {
            id: 2,
            year: 2013,
            title: 'Первый крупный проект',
            description: 'Реализован проект жилого комплекса бизнес-класса. Бюро вышло на новый уровень и привлекло внимание крупных застройщиков.',
            achievements: ['Жилой комплекс "Золотые пески"', 'Площадь: 15 000 м²'],
            image: '🏗️',
            icon: '🏆'
        },
        {
            id: 3,
            year: 2016,
            title: 'Расширение штата',
            description: 'Открыт отдел ландшафтного дизайна и 3D-визуализации. Штат вырос до 25 специалистов.',
            achievements: ['+12 новых сотрудников', 'Запуск онлайн-портфолио'],
            image: '👥',
            icon: '📈'
        },
        {
            id: 4,
            year: 2018,
            title: 'Международное признание',
            description: 'Победа в международном конкурсе архитектурных проектов. Бюро начало сотрудничество с зарубежными партнёрами.',
            achievements: ['Премия "Архитектор года"', 'Проекты в Германии и ОАЭ'],
            image: '🌍',
            icon: '🏅'
        },
        {
            id: 5,
            year: 2021,
            title: 'Собственный шоурум',
            description: 'Открытие фирменного шоурума и офиса площадью 500 м² с выставочным пространством материалов и технологий.',
            achievements: ['500+ посетителей в месяц', '100+ партнёров-поставщиков'],
            image: '🏢',
            icon: '🎨'
        },
        {
            id: 6,
            year: 2024,
            title: 'Новые горизонты',
            description: 'Запуск направления устойчивой архитектуры и «зелёного» строительства. Внедрение BIM-технологий.',
            achievements: ['50+ реализованных проектов', 'Команда: 50+ профессионалов'],
            image: '🚀',
            icon: '💚'
        }
    ];

    return (
        <section className="history-slider-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-badge">
                        <Typography variant="small" color="primary" weight="bold">
                            Наша история
                        </Typography>
                    </span>
                    <Typography variant="h2" color="dark" weight="bold" align="center">
                        Вехи развития
                    </Typography>
                    <Typography variant="body" color="primary" align="center" className="history-subtitle">
                        От основания до лидера в архитектурной среде
                    </Typography>
                </div>

                <div className="slider-wrapper">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        centeredSlides={true}
                        loop={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next-custom',
                            prevEl: '.swiper-button-prev-custom',
                        }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        breakpoints={{
                            768: {
                                slidesPerView: 1.2,
                                centeredSlides: true,
                            },
                            1024: {
                                slidesPerView: 1.5,
                                centeredSlides: true,
                            },
                        }}
                        className="history-swiper"
                    >
                        {historyData.map((item, index) => (
                            <SwiperSlide key={item.id}>
                                <div className={`history-card ${activeIndex === index ? 'active' : ''}`}>
                                    <div className="history-year-badge">
                                        <FaCalendarAlt />
                                        <Typography variant="h2" color="white" weight="bold">
                                            {item.year}
                                        </Typography>
                                    </div>

                                    <div className="history-content">
                                        <div className="history-icon">{item.icon}</div>
                                        <Typography variant="h3" color="dark" weight="bold">
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body" color="primary" className="history-description">
                                            {item.description}
                                        </Typography>

                                        <div className="history-achievements">
                                            <Typography variant="small" color="primary" weight="bold">
                                                Ключевые достижения:
                                            </Typography>
                                            <ul>
                                                {item.achievements.map((achievement, i) => (
                                                    <li key={i}>
                                                        <span className="checkmark">✓</span>
                                                        <Typography variant="small" color="primary">
                                                            {achievement}
                                                        </Typography>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="history-image-placeholder">
                                            <span>{item.image}</span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                        
                    {/* Кастомные кнопки навигации */}
                    <button className="swiper-button-prev-custom">
                        <FaArrowLeft />
                    </button>
                    <button className="swiper-button-next-custom">
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HistorySlider;
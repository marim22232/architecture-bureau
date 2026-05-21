import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import Typography from '../Typography/Typography';

// Фикс для иконок маркеров
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Только города России
const cities = [
  { name: "Москва", country: "Россия", coords: [55.7558, 37.6173], projects: 45 },
  { name: "Санкт-Петербург", country: "Россия", coords: [59.9343, 30.3351], projects: 28 },
  { name: "Новосибирск", country: "Россия", coords: [55.0084, 82.9357], projects: 12 },
  { name: "Екатеринбург", country: "Россия", coords: [56.8389, 60.6057], projects: 10 },
  { name: "Казань", country: "Россия", coords: [55.7887, 49.1221], projects: 9 },
  { name: "Нижний Новгород", country: "Россия", coords: [56.2965, 43.9361], projects: 8 },
  { name: "Челябинск", country: "Россия", coords: [55.1644, 61.4368], projects: 7 },
  { name: "Самара", country: "Россия", coords: [53.1959, 50.1008], projects: 7 },
  { name: "Омск", country: "Россия", coords: [54.9885, 73.3242], projects: 6 },
  { name: "Ростов-на-Дону", country: "Россия", coords: [47.2357, 39.7015], projects: 8 },
  { name: "Уфа", country: "Россия", coords: [54.7388, 55.9721], projects: 6 },
  { name: "Красноярск", country: "Россия", coords: [56.0153, 92.8932], projects: 5 },
  { name: "Пермь", country: "Россия", coords: [58.0104, 56.2502], projects: 6 },
  { name: "Воронеж", country: "Россия", coords: [51.6608, 39.2003], projects: 5 },
  { name: "Сочи", country: "Россия", coords: [43.5855, 39.7303], projects: 12 },
  { name: "Томск", country: "Россия", coords: [56.4846, 84.9477], projects: 4 },
  { name: "Оренбург", country: "Россия", coords: [51.7682, 55.0969], projects: 3 },
  { name: "Кемерово", country: "Россия", coords: [55.3544, 86.0881], projects: 3 },
  { name: "Новокузнецк", country: "Россия", coords: [53.7596, 87.1216], projects: 2 },
  { name: "Рязань", country: "Россия", coords: [54.6299, 39.7429], projects: 3 },
  { name: "Симферополь", country: "Россия", coords: [44.9521, 34.1024], projects: 3 },
];

const WorldMap = () => {
  const [activeCity, setActiveCity] = useState(null);
  
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Подсчёт уникальных стран (будет 1 - Россия)
  const uniqueCountries = [...new Set(cities.map(city => city.country))];
  const totalProjects = cities.reduce((sum, city) => sum + city.projects, 0);

  return (
    <div className="world-map-container">
      <MapContainer
        center={[60, 65]}  // Сместил центр карты на Россию
        zoom={3.5}          // Увеличил зум, чтобы была видна вся Россия
        style={{ height: '500px', width: '100%', borderRadius: '24px' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {cities.map((city, idx) => (
          <Marker
            key={idx}
            position={city.coords}
            eventHandlers={{
              click: () => setActiveCity(city),
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#A08972' }}>{city.name}</strong>
                <br />
                <span style={{ fontSize: '12px' }}>{city.country}</span>
                <br />
                {city.projects}+ проектов
                <br />
                <a href={`/projects?country=${encodeURIComponent(city.country)}`} style={{ color: '#A08972', fontSize: '12px' }}>
                  Подробнее →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Информация о городе */}
      {activeCity && (
        <div className="city-info">
          <button className="city-info-close" onClick={() => setActiveCity(null)}>✕</button>
          <Typography variant="h4" color="dark" weight="semibold">
            {activeCity.name}
          </Typography>
          <Typography variant="small" color="primary" className="city-country">
            {activeCity.country}
          </Typography>
          <Typography variant="body" color="primary" className="projects-count">
            {activeCity.projects}+ проектов
          </Typography>
          <a href={`/projects?country=${encodeURIComponent(activeCity.country)}`}>
            Смотреть проекты →
          </a>
        </div>
      )}

      {/* Статистика */}
      <div className="map-stats" ref={ref}>
        <div className="map-stat">
          <Typography variant="h2" color="accent" weight="bold" className="stat-number">
            {inView && <CountUp end={uniqueCountries.length} duration={2} suffix="+" />}
          </Typography>
          <Typography variant="small" color="primary" className="stat-label">
            СТРАН
          </Typography>
        </div>
        <div className="map-stat">
          <Typography variant="h2" color="accent" weight="bold" className="stat-number">
            {inView && <CountUp end={cities.length} duration={1.5} suffix="+" />}
          </Typography>
          <Typography variant="small" color="primary" className="stat-label">
            ГОРОДОВ
          </Typography>
        </div>
        <div className="map-stat">
          <Typography variant="h2" color="accent" weight="bold" className="stat-number">
            {inView && <CountUp end={totalProjects} duration={2} suffix="+" />}
          </Typography>
          <Typography variant="small" color="primary" className="stat-label">
            ПРОЕКТОВ
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
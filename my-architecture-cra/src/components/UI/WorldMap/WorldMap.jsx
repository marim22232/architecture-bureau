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

// Дружественные страны для России (без санкционных рисков)
const cities = [
  // Россия и СНГ
  { name: "Москва", country: "Россия", coords: [55.7558, 37.6173], projects: 45 },
  { name: "Санкт-Петербург", country: "Россия", coords: [59.9343, 30.3351], projects: 28 },
  { name: "Сочи", country: "Россия", coords: [43.5855, 39.7303], projects: 12 },
  { name: "Казань", country: "Россия", coords: [55.7887, 49.1221], projects: 8 },
  { name: "Екатеринбург", country: "Россия", coords: [56.8389, 60.6057], projects: 7 },
  { name: "Новосибирск", country: "Россия", coords: [55.0084, 82.9357], projects: 6 },
  { name: "Минск", country: "Беларусь", coords: [53.9045, 27.5615], projects: 10 },
  { name: "Алматы", country: "Казахстан", coords: [43.2220, 76.8512], projects: 8 },
  { name: "Астана", country: "Казахстан", coords: [51.1694, 71.4491], projects: 6 },
  { name: "Ташкент", country: "Узбекистан", coords: [41.2995, 69.2401], projects: 5 },
  { name: "Баку", country: "Азербайджан", coords: [40.4093, 49.8671], projects: 4 },
  { name: "Ереван", country: "Армения", coords: [40.1792, 44.4991], projects: 3 },
  { name: "Тбилиси", country: "Грузия", coords: [41.7151, 44.8271], projects: 5 },
  { name: "Кишинёв", country: "Молдова", coords: [47.0105, 28.8638], projects: 3 },
  { name: "Бишкек", country: "Кыргызстан", coords: [42.8746, 74.5698], projects: 4 },
  { name: "Душанбе", country: "Таджикистан", coords: [38.5598, 68.7870], projects: 2 },
  { name: "Ашхабад", country: "Туркменистан", coords: [37.9601, 58.3261], projects: 2 },
  
  // Страны БРИКС и дружественные
  { name: "Пекин", country: "Китай", coords: [39.9042, 116.4074], projects: 12 },
  { name: "Шанхай", country: "Китай", coords: [31.2304, 121.4737], projects: 10 },
  { name: "Дели", country: "Индия", coords: [28.6139, 77.2090], projects: 8 },
  { name: "Мумбаи", country: "Индия", coords: [19.0760, 72.8777], projects: 6 },
  { name: "Дубай", country: "ОАЭ", coords: [25.2048, 55.2965], projects: 7 },
  { name: "Абу-Даби", country: "ОАЭ", coords: [24.4539, 54.3773], projects: 5 },
  { name: "Стамбул", country: "Турция", coords: [41.0082, 28.9784], projects: 8 },
  { name: "Анкара", country: "Турция", coords: [39.9334, 32.8597], projects: 4 },
  { name: "Каир", country: "Египет", coords: [30.0444, 31.2357], projects: 5 },
  { name: "Йоханнесбург", country: "ЮАР", coords: [-26.2041, 28.0473], projects: 4 },
  { name: "Касабланка", country: "Марокко", coords: [33.5731, -7.5898], projects: 3 },
  { name: "Тегеран", country: "Иран", coords: [35.6892, 51.3890], projects: 4 },
  { name: "Ханой", country: "Вьетнам", coords: [21.0285, 105.8542], projects: 3 },
  { name: "Джакарта", country: "Индонезия", coords: [-6.2088, 106.8456], projects: 3 },
  { name: "Белград", country: "Сербия", coords: [44.7866, 20.4489], projects: 4 },
  { name: "Будапешт", country: "Венгрия", coords: [47.4979, 19.0402], projects: 3 },
  { name: "Белград", country: "Сербия", coords: [44.7866, 20.4489], projects: 4 },
];

const WorldMap = () => {
  const [activeCity, setActiveCity] = useState(null);
  
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Подсчёт уникальных стран
  const uniqueCountries = [...new Set(cities.map(city => city.country))];
  const totalProjects = cities.reduce((sum, city) => sum + city.projects, 0);

  return (
    <div className="world-map-container">
      <MapContainer
        center={[30, 60]}
        zoom={2}
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
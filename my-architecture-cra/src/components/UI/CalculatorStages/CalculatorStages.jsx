import React, { useState } from 'react';
import './CalculatorStages.css';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButtonOutline from '../../UI/MyButtonOutline/MyButtonOutline.jsx';
import MyButton from '../../UI/MyButton/MyButton.jsx';

// Импорт изображений для этапов
import stage1Img from '../../../assets/images/stages/stage1.jpg';
import stage2Img from '../../../assets/images/stages/stage2.jpg';
import stage3Img from '../../../assets/images/stages/stage3.jpg';
import stage4Img from '../../../assets/images/stages/stage4.jpg';
import stage5Img from '../../../assets/images/stages/stage5.jpg';
import stage6Img from '../../../assets/images/stages/stage6.jpg';

// Если картинок пока нет, можно использовать заглушки
const stageImages = {
  1: stage1Img || 'https://via.placeholder.com/600x400/4B6473/FFFFFF?text=Знакомство',
  2: stage2Img || 'https://via.placeholder.com/600x400/4B6473/FFFFFF?text=Эскизный+проект',
  3: stage3Img || 'https://via.placeholder.com/600x400/4B6473/FFFFFF?text=Строительный+проект',
  4: stage4Img || 'https://via.placeholder.com/600x400/4B6473/FFFFFF?text=Инженерные+сети',
  5: stage5Img || 'https://via.placeholder.com/600x400/4B6473/FFFFFF?text=Строительство',
  6: stage6Img || 'https://via.placeholder.com/600x400/4B6473/FFFFFF?text=Интерьер',
};

const stagesData = {
  1: {
    title: "ЭТАП 1",
    subtitle: "ПРЕДПРОЕКТНАЯ ПОДГОТОВКА (ЗНАКОМСТВО)",
    description: `Представляет собой знакомство с заказчиком и определение его первоначального запроса.`,
    steps: [
      { title: "Бриф", text: "Мы организовываем встречу с нашим арт-директором в живом или онлайн формате. В ходе встречи в неформальной обстановке вы рассказываете о том, каким вы видите свой будущий дом, о ваших вкусах и пожеланиях, предполагаемом бюджете и т.д." },
      { title: "Анкетирование", text: "Вы заполняете бриф — уникальную анкету, которая поможет систематизировать ваши мысли и даст грамотное техническое задание для архитекторов. Затем формируется коммерческое предложение и заключается договор." }
    ],
    duration: "2-5 дней",
    result: "Заполненный бриф, референсы, понимание проекта"
  },
  2: {
    title: "ЭТАП 2",
    subtitle: "АРХИТЕКТУРНО-ПЛАНИРОВОЧНАЯ КОНЦЕПЦИЯ (ЭСКИЗНЫЙ ПРОЕКТ)",
    description: `Совмещаем ваши пожелания с исходными данными об участке и получаем объемную модель будущего дома с визуальной составляющей.`,
    steps: [
      { title: "Идея и зонирование", text: "На основании брифа делаем первый набросок дома, продумываем взаимосвязи помещений и посадку дома на участок." },
      { title: "3D-модель и планировка", text: "Создаем объемную модель дома, разрабатываем детальные планировочные решения с расстановкой мебели." },
      { title: "Визуализации", text: "Создаем фотореалистичные визуализации дома на участке, уточняем фасадные материалы и их стоимость." }
    ],
    duration: "2-4 недели",
    result: "Эскизный проект с визуализациями и примерной сметой на строительство"
  },
  3: {
    title: "ЭТАП 3",
    subtitle: "АРХИТЕКТУРНЫЕ И КОНСТРУКТИВНЫЕ РЕШЕНИЯ (СТРОИТЕЛЬНЫЙ ПРОЕКТ)",
    description: `Даем четкие инструкции как воплотить нашу идею в жизнь. Строительный проект включает конструктивные и архитектурные решения.`,
    steps: [
      { title: "Конструктивные решения", text: "Инженер-конструктор рассчитывает нагрузки на здание, проектирует фундамент, несущие элементы и рассчитывает количество материалов." },
      { title: "Архитектурные решения", text: "Архитектор детализирует проект: количество окон, материалы фасада, утепление, создает ведомость основных материалов." }
    ],
    duration: "4-8 недель",
    result: "Строительный проект с чертежами, ведомостью материалов и инструкцией для подрядчиков"
  },
  4: {
    title: "ЭТАП 4",
    subtitle: "ИНЖЕНЕРНЫЕ СЕТИ И СТРОИТЕЛЬСТВО",
    description: `Проектирование инженерных систем и полный цикл строительных работ под ключ.`,
    steps: [
      { title: "Инженерные сети", text: "Разрабатываем проекты отопления, вентиляции, водоснабжения, канализации. Все решения вносятся в BIM-модель для проверки на отсутствие пересечений." },
      { title: "Выбор подрядчика", text: "Проводим тендер среди проверенных подрядчиков, помогаем заключить договор с фиксацией сроков и гарантий." },
      { title: "Строительство", text: "Контролируем все этапы: нулевой цикл, возведение стен, кровлю, фасады, инженерные коммуникации, черновую отделку." },
      { title: "Приемка объекта", text: "Проводим итоговую приемку работ, проверяем соответствие проекту, подписываем акты и передаем гарантийную документацию." }
    ],
    duration: "6-12 месяцев",
    result: "Готовый объект под чистовую отделку с полным пакетом документов и гарантией"
  },
  5: {
    title: "ЭТАП 5",
    subtitle: "ДИЗАЙН ИНТЕРЬЕРА",
    description: `Создаем уникальное комфортное пространство, которое отражает ваш образ жизни и приносит эстетическое удовольствие.`,
    steps: [
      { title: "Концепция", text: "Разрабатываем планировочные решения, цветовую палитру, подбираем материалы, мебель и декор, создаем 3D-схемы помещений." },
      { title: "Визуализации", text: "Создаем фотореалистичные визуализации интерьера, уточняем материалы и их стоимость." },
      { title: "Рабочая документация", text: "Разрабатываем чертежи для строителей: планы электрики, освещения, расстановки мебели, спецификации материалов." }
    ],
    duration: "3-4 месяца",
    result: "Полный пакет рабочей документации, визуализации интерьера, смета на реализацию"
  },
  6: {
    title: "ЭТАП 6",
    subtitle: "РЕАЛИЗАЦИЯ ИНТЕРЬЕРА ПОД КЛЮЧ",
    description: `Полный контроль реализации интерьера — от закупки материалов до финальной отделки и меблировки.`,
    steps: [
      { title: "Служба заказчика", text: "Берем на себя контроль и руководство реализацией полностью. Организуем работу подрядчиков, контролируем сроки и качество." },
      { title: "Авторский надзор", text: "Проверяем соответствие объекта дизайн-проекту, консультируем строителей, решаем возникающие вопросы." },
      { title: "Комплектация", text: "Помогаем с закупкой материалов, мебели, светильников, сантехники и декора у проверенных поставщиков." },
      { title: "Финальная отделка", text: "Контролируем чистовую отделку, монтаж мебели, подключение техники и установку декора." }
    ],
    duration: "4-8 месяцев",
    result: "Готовый интерьер под ключ с полной меблировкой, декором и техникой"
  }
};

const CalculatorStages = () => {
  const [activeStage, setActiveStage] = useState(null);

  const stagesList = [
    { id: 1, name: "ЗНАКОМСТВО" },
    { id: 2, name: "ЭСКИЗНЫЙ ПРОЕКТ" },
    { id: 3, name: "СТРОИТЕЛЬНЫЙ ПРОЕКТ" },
    { id: 4, name: "ИНЖЕНЕРНЫЕ СЕТИ И СТРОИТЕЛЬСТВО" },
    { id: 5, name: "ДИЗАЙН ИНТЕРЬЕРА" },
    { id: 6, name: "РЕАЛИЗАЦИЯ ИНТЕРЬЕРА" }
  ];

  const handleStageClick = (stageId) => {
    setActiveStage(stageId);
  };

  const stage = activeStage ? stagesData[activeStage] : null;
  const stageImage = activeStage ? stageImages[activeStage] : null;

  return (
    <div className="calculator-stages">
      {/* Кнопки этапов */}
      <div className="stages-buttons">
        {stagesList.map((item) => (
          <button
            key={item.id}
            className={`stage-button ${activeStage === item.id ? 'active' : ''}`}
            onClick={() => handleStageClick(item.id)}
          >
            <span className="stage-number">{item.id}</span>
            <span className="stage-name">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Содержимое выбранного этапа */}
      {activeStage && stage ? (
        <div className="stage-content">
          <div className="stage-header">
            <div className="stage-header-text">
              <Typography variant="h3" color="accent" weight="bold" className="stage-title">
                {stage.title}
              </Typography>
              <Typography variant="h2" color="dark" weight="bold" className="stage-subtitle">
                {stage.subtitle}
              </Typography>
            </div>
            {stageImage && (
              <div className="stage-image">
                <img src={stageImage} alt={stage.subtitle} />
              </div>
            )}
          </div>
          
          <Typography variant="body" color="primary" className="stage-description">
            {stage.description}
          </Typography>

          {/* Список шагов */}
          {stage.steps && (
            <div className="stage-steps">
              {stage.steps.map((step, idx) => (
                <div key={idx} className="step-item">
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-content">
                    <Typography variant="h4" color="dark" weight="semibold">
                      {step.title}
                    </Typography>
                    <Typography variant="body" color="primary">
                      {step.text}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Информация о сроках и результате */}
          <div className="stage-info">
            <div className="info-block">
              <span className="info-icon">⏱️</span>
              <Typography variant="small" color="primary">Срок реализации</Typography>
              <Typography variant="h4" color="accent" weight="bold">
                {stage.duration}
              </Typography>
            </div>
            <div className="info-block">
              <span className="info-icon">📋</span>
              <Typography variant="small" color="primary">Результат</Typography>
              <Typography variant="body" color="primary">
                {stage.result}
              </Typography>
            </div>
          </div>
        </div>
      ) : (
        <div className="stage-placeholder">
          <div className="placeholder-icon">🏗️</div>
          <Typography variant="h3" color="dark" weight="bold">
            Выберите этап проектирования
          </Typography>
          <Typography variant="body" color="primary" align="center">
            Нажмите на любой этап выше, чтобы узнать подробности о процессе проектирования и строительства
          </Typography>
        </div>
      )}
    </div>
  );
};

export default CalculatorStages;
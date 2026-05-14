import React, { useRef } from 'react';
import './Calculator.css';
import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButtonOutline from '../../components/UI/MyButtonOutline/MyButtonOutline.jsx';
import ProjectsSlider from '../../components/UI/ProjectsSlider/ProjectsSlider.jsx';
import CalculatorStages from '../../components/UI/CalculatorStages/CalculatorStages.jsx';
import Calculatorrr from '../../components/UI/Calculator/Calculatorrr.jsx';
import SimpleSlider from '../../components/UI/SimpleSlider/SimpleSlider.jsx';

const Calculator = () => {
    const calculatorRef = useRef(null);

    // Функция прокрутки
    const scrollToCalculator = () => {
        calculatorRef.current?.scrollIntoView({
            behavior: 'smooth', // плавная прокрутка
            block: 'start',     // прижать к верху экрана
        });
    };
    return (
        <div className="calculator-page">
            <section className='hero-calculator'>
                <div className='container-inner'>
                    <Typography variant="body" align="center" color="primary" className="calculator-label">
                        Разработка индивидуального проекта
                    </Typography>
                    <Typography variant="h1" align="center" color="dark" weight="bold">
                        Рассчитайте стоимость проекта
                    </Typography>
                    <Typography variant="body" align="center" color="primary" className="calculator-description">
                        Наш интуитивно понятный онлайн-калькулятор учитывает все ваши пожелания
                        и выдает предварительную смету без лишних встреч и переговоров. Просто, прозрачно и сразу.
                    </Typography>
                    <div className="calculator-buttons">
                        <MyButtonOutline style={{ width: 420 }}  onClick={scrollToCalculator} >
                            Начать расчет
                        </MyButtonOutline>
                    </div>
                </div>
            </section>

            {/* Слайдер проектов */}
            <section className="projects-section">
                <div className="container-inner">
                    <Typography variant="h2" align="center">
                        Наши проекты
                    </Typography>
                    <SimpleSlider></SimpleSlider>
                </div>
            </section>
            <section className="stages">
                <div className="stages-header">
                    <Typography variant="body" align="center" color="primary" className="stages-label">
                        Этапы выполнения работ
                    </Typography>
                    <Typography variant="h2" align="center" color="dark" weight="bold">
                        Стадии проектирования
                    </Typography>
                </div>
                {/* Этапы выполнения работ */}
                <CalculatorStages />
            </section>

            {/* Сам калькулятор (пока заглушка) */}
            <section className="calculator-form-section" ref={calculatorRef}>
                <div className="container-inner">
                    <Typography variant="h2" align="center">
                        Калькулятор стоимости
                    </Typography>
                    <div className="calculator-placeholder">
                        <Calculatorrr />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Calculator;
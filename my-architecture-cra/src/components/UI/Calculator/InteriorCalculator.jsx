import React from 'react';
import './Calculatorrr.css';
import Typography from '../Typography/Typography.jsx';
import MyButton from '../MyButton/MyButton.jsx';
import MyInput from '../MyInput/MyInput.jsx';
import ContactForm from '../ContactForm/ContactForm.jsx';
import { useCalculator } from '../../../hooks/useCalculator.js';
import { Link } from 'react-router-dom';


const InteriorCalculator = ({ onBack }) => {
    const {
        step, services, projectTypes, selectedServices, loading, error,
        formData, showResult, handleCheckboxChange, handleInputChange,
        goToNextStep, goToPrevStep, setStep,
        calculatePrice, canGoNext, resetForm, setShowResult,
        getCalculatorData
    } = useCalculator({
        categorySlug: 'interior',
        initialArea: 75,
        initialData: { objectType: '' },
        projectTypeId: null, // ← Теперь берётся из базы автоматически
        onPriceCalculate: ({ services, selectedServices, formData }) => {
    // ✅ Теперь используем projectTypes из замыкания (сверху)
    const selectedProjectType = projectTypes.find(pt => pt.id === formData.projectTypeId);
    const typeCoeff = selectedProjectType?.category_slug === 'interior' 
        ? (formData.objectType === 'public' ? 1.3 : formData.objectType === 'office' ? 1.1 : 1)
        : 1;
    
    let total = 0;
    selectedServices.forEach(id => {
        const service = services.find(s => s.id === id);
        if (!service) return;
        
        if (service.price_per_sqm) {
            total += service.price_per_sqm * formData.area * typeCoeff;
        }
        if (service.price_fixed) {
            total += service.price_fixed;
        }
    });
    return Math.round(total);
}
    });

    const canGoNextCustom = () => {
        if (step === 1) return formData.projectTypeId || projectTypes.length === 1;
        return canGoNext();
    };

    const StepIndicator = ({ currentStep, totalSteps }) => (
        <div className="step-indicator">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div
                    key={i}
                    className={`step-dot ${currentStep === i + 1 ? 'active' : ''} ${currentStep > i + 1 ? 'completed' : ''}`}
                    aria-label={`Шаг ${i + 1}`}
                />
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="calculator-loading">
                <Typography variant="body" align="center">Загрузка...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div className="calculator-error">
                <Typography variant="body" align="center" color="error">{error}</Typography>
                <MyButton onClick={() => window.location.reload()}>Попробовать снова</MyButton>
            </div>
        );
    }

    if (showResult) {
        const total = calculatePrice();
        const selectedProjectType = projectTypes.find(pt => pt.id === formData.projectTypeId);

        return (
            <div className="calculator-result">
                <MyButton className="back-to-mode" onClick={onBack}>← Назад к выбору</MyButton>

                <Typography variant="h2" align="center" color="dark" weight="bold">
                    Стоимость дизайна интерьера
                </Typography>

                <div className="result-summary">
                    <div className="result-price">
                        <span className="price-number">{total.toLocaleString('ru-RU')}</span>
                        <span className="price-currency">₽</span>
                    </div>
                    <Typography variant="body" align="center" color="primary">
                        * Точная стоимость будет рассчитана после консультации с дизайнером
                    </Typography>
                </div>

                <div className="result-details">
                    <Typography variant="h4" color="dark" weight="semibold">
                        Параметры расчёта:
                    </Typography>
                    <ul className="result-list">
                        {selectedServices.map(id => {
                            const service = services.find(s => s.id === id);
                            if (!service) return null;
                            const price = service.price_per_sqm
                                ? Math.round(service.price_per_sqm * formData.area)
                                : service.price_fixed;
                            return (
                                <li key={id}>
                                    {service.title} — {price?.toLocaleString('ru-RU')} ₽
                                </li>
                            );
                        })}
                        <li><strong>Площадь:</strong> {formData.area} м²</li>
                        {selectedProjectType && (
                            <li><strong>Тип объекта:</strong> {selectedProjectType.name}</li>
                        )}
                    </ul>
                </div>

                <div className="result-buttons">
                    <MyButton onClick={resetForm}>Рассчитать заново</MyButton>
                    <Link to='/contacts'>
                    <MyButton variant="primary" >
                        Получить консультацию
                    </MyButton>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="calculator">
            <MyButton className="back-to-mode" onClick={onBack}>← Назад к выбору</MyButton>
            <StepIndicator currentStep={step} totalSteps={3} />

            {step === 1 && (
                <div className="calculator-step">
                    <Typography variant="h2" align="center" color="dark" weight="bold">
                        1. Выберите тип объекта
                    </Typography>

                    <div className="object-types">
                        {projectTypes.map(type => (
                            <MyButton
                                key={type.id}
                                className={`object-type-btn ${formData.projectTypeId === type.id ? 'selected' : ''}`}
                                onClick={() => handleInputChange({ 
                                    target: { name: 'projectTypeId', value: type.id } 
                                })}
                                variant={formData.projectTypeId === type.id ? 'primary' : 'secondary'}
                            >
                                <span className="object-label">{type.name}</span>
                            </MyButton>
                        ))}
                    </div>

                    <div className="step-buttons">
                        <MyButton variant="primary" onClick={goToNextStep} disabled={!canGoNextCustom()}>
                            Далее
                        </MyButton>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="calculator-step">
                    <Typography variant="h2" align="center" color="dark" weight="bold">
                        2. Состав работ и площадь
                    </Typography>

                    <div className="area-input-wrapper">
                        <label className="area-label">Площадь объекта:</label>
                        <div className="area-input">
                            <MyInput type="number" name="area" value={formData.area} onChange={handleInputChange} min="1" max="10000" />
                            <span className="area-unit">м²</span>
                        </div>
                    </div>

                    <Typography variant="h4" color="dark" weight="semibold" className="services-title">
                        Выберите услуги:
                    </Typography>

                    <div className="services-grid">
                        {services.map(service => (
                            <label key={service.id} className="service-card">
                                <MyInput type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => handleCheckboxChange(service.id)} />
                                <div className="service-content">
                                    <span className="service-title">{service.title}</span>
                                    <span className="service-price">
                                        {service.price_per_sqm ? `от ${service.price_per_sqm.toLocaleString('ru-RU')} ₽/м²` :
                                            service.price_fixed ? `${service.price_fixed.toLocaleString('ru-RU')} ₽` :
                                                service.price_range || 'По запросу'}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="step-buttons">
                        <MyButton onClick={goToPrevStep}>Назад</MyButton>
                        <MyButton variant="primary" onClick={goToNextStep} disabled={!canGoNext()}>Далее</MyButton>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="calculator-step">
                    <Typography variant="h2" align="center" color="dark" weight="bold" style={{margin: '5px'}}>
                        3. Ваши контактные данные
                    </Typography>

                    <ContactForm 
                        variant="calculator"
                        title="Оставьте заявку"
                        subtitle="Заполните форму, и мы свяжемся с вами для уточнения деталей"
                        buttonText="Отправить заявку"
                        calculatorData={getCalculatorData()}
                        onSuccess={() => setShowResult(true)}
                    />

                    <div className="step-buttons">
                        <MyButton onClick={goToPrevStep}>Назад</MyButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteriorCalculator;
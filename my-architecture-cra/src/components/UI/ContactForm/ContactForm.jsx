import React, { useState } from 'react';
import './ContactForm.css';
import Typography from '../Typography/Typography.jsx';
import MyInput from '../MyInput/MyInput.jsx';
import MyTextarea from '../MyTextarea/MyTextarea.jsx';
import MyButton from '../MyButton/MyButton.jsx';

const ContactForm = ({
    title = "Напишите нам",
    subtitle = "Мы ответим на любые интересующие вас вопросы",
    buttonText = "ОТПРАВИТЬ",
    variant = "default",
    calculatorData = {},
    onSuccess = () => { },
    className = ""
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        phone: '',
        email: '',
        message: '',
        question: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let requestData = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
        };

        if (variant === 'calculator') {
            // Используем данные из calculatorData (ID)
            requestData = {
                ...requestData,
                project_type_id: calculatorData.project_type_id,
                selected_services: calculatorData.selected_services,  // массив ID
                area: calculatorData.area,
                message: `Дополнительно: ${formData.message || 'не указано'}`
            };
            
            console.log('Отправляемые данные (калькулятор):', requestData);
        } else {
            // Обычная форма
            requestData = {
                ...requestData,
                city: formData.city,
                question: formData.question,
                message: `${formData.city ? `Город: ${formData.city}\n` : ''}Вопрос: ${formData.question}`
            };
        }

        try {
            const response = await fetch('http://localhost:5000/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });
            
            const result = await response.json();
            console.log('Ответ сервера:', result);
            
            if (response.ok) {
                alert('Спасибо! Ваша заявка отправлена.');
                setFormData({
                    name: '', city: '', phone: '', email: '', message: '', question: ''
                });
                if (onSuccess) onSuccess();
            } else {
                alert(result.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={`contact-form-component ${className}`}>
            <Typography variant="h2" color="white" align="center" weight="bold">
                {title}
            </Typography>
            <Typography variant="body" color="white" align="center" className="form-subtitle">
                {subtitle}
            </Typography>

            <form onSubmit={handleSubmit}>
                {variant === 'calculator' ? (
                    // Форма для калькулятора
                    <>
                        <MyInput
                            type="text"
                            name="name"
                            placeholder="ФИО *"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <MyInput
                            type="tel"
                            name="phone"
                            placeholder="Телефон *"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                        <MyInput
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <MyTextarea
                            name="message"
                            placeholder="Сообщение *"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={4}
                        />
                    </>
                ) : (
                    // Стандартная форма (главная страница)
                    <>
                        {isExpanded && (
                            <div className="extra-fields">
                                <MyInput
                                    type="text"
                                    name="name"
                                    placeholder="ФИО *"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <MyInput
                                    type="text"
                                    name="city"
                                    placeholder="Город, страна *"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                                <MyInput
                                    type="tel"
                                    name="phone"
                                    placeholder="Телефон *"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <MyInput
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <MyTextarea
                            name="question"
                            placeholder="Что вас интересует? *"
                            value={formData.question}
                            onChange={handleChange}
                            onFocus={() => setIsExpanded(true)}
                            required
                        />
                    </>
                )}

                <MyButton
                    type="submit"
                    variant="dark"
                    disabled={loading}
                >
                    {loading ? 'Отправка...' : buttonText}
                </MyButton>
            </form>
        </div>
    );
};

export default ContactForm;
import { useState, useEffect, useCallback } from 'react';
import {
    getServicesByCategorySlug,
    getProjectTypesByCategory
} from '../services/api';

export const useCalculator = ({
    categorySlug,
    initialArea = 50,
    initialData = {},
    onPriceCalculate,
    projectTypeId
}) => {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState([]); // ✅ уже пустой массив
    const [projectTypes, setProjectTypes] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        area: initialArea,
        ...initialData,
        name: '',
        phone: '',
        email: '',
        message: '',
        projectTypeId: projectTypeId || null
    });

    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Параллельная загрузка
                const [servicesData, projectTypesData] = await Promise.all([
                    getServicesByCategorySlug(categorySlug),
                    getProjectTypesByCategory(categorySlug)
                ]);

                if (isMounted) {
                    // ✅ ЗАЩИТА ОТ UNDEFINED
                    setServices(Array.isArray(servicesData) ? servicesData : []);
                    setProjectTypes(Array.isArray(projectTypesData) ? projectTypesData : []);

                    // Устанавливаем первый тип проекта по умолчанию, если не задан
                    if (projectTypesData?.length > 0 && !formData.projectTypeId) {
                        setFormData(prev => ({
                            ...prev,
                            projectTypeId: projectTypesData[0].id
                        }));
                    }
                }
            } catch (err) {
                console.error(`Ошибка загрузки данных (${categorySlug}):`, err);
                if (isMounted) {
                    setError(err.message || 'Не удалось загрузить данные');
                    setServices([]); // ✅ при ошибке тоже пустой массив
                    setProjectTypes([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [categorySlug]);

    const handleCheckboxChange = useCallback((serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const goToNextStep = useCallback(() => setStep(prev => prev + 1), []);
    const goToPrevStep = useCallback(() => setStep(prev => prev - 1), []);

    const calculatePrice = useCallback(() => {
        // ✅ ЗАЩИТА ОТ UNDEFINED
        if (!services || services.length === 0) return 0;

        if (typeof onPriceCalculate === 'function') {
            return onPriceCalculate({ services, selectedServices, formData });
        }

        let total = 0;
        selectedServices.forEach(id => {
            const service = services.find(s => s.id === id);
            if (!service) return;

            if (service.price_per_sqm) {
                total += service.price_per_sqm * (formData.area || 0);
            }
            if (service.price_fixed) {
                total += service.price_fixed;
            }
        });

        return Math.round(total);
    }, [services, selectedServices, formData, onPriceCalculate]);

    const canGoNext = useCallback(() => {
        if (step === 1) return selectedServices.length > 0;
        if (step === 2) return formData.area > 0 && formData.area <= 10000;
        return true;
    }, [step, selectedServices, formData.area]);

    const resetForm = useCallback(() => {
        setFormData({
            area: initialArea,
            ...initialData,
            name: '',
            phone: '',
            email: '',
            message: '',
            projectTypeId: projectTypeId || null
        });
        setStep(1);
        setShowResult(false);
        setSelectedServices([]);
        setError(null);
    }, [initialArea, initialData, projectTypeId]);

    const getCalculatorData = useCallback(() => ({
        project_type_id: formData.projectTypeId,
        selected_services: selectedServices,
        area: formData.area,
        ...Object.fromEntries(
            Object.entries(initialData).filter(([key]) => key !== 'area')
        )
    }), [formData.projectTypeId, selectedServices, formData.area, initialData]);

    return {
        step, services, projectTypes, selectedServices, loading, error, formData, showResult,
        setSelectedServices, setFormData, handleCheckboxChange, handleInputChange,
        goToNextStep, goToPrevStep, setStep,
        calculatePrice, canGoNext, resetForm, setShowResult,
        getCalculatorData, totalSteps: 3
    };
};
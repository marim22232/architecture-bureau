// src/utils/imageUtils.js

// 🔥 Проверяем, что переменная окружения загрузилась
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://my-architecture-api.onrender.com';

console.log('🌍 [imageUtils] API_BASE_URL:', API_BASE_URL);
console.log('🌍 [imageUtils] process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const getImageUrl = (imagePath) => {
    // 🔥 ЛОГИРУЕМ каждый вызов
    console.log('🖼️ [getImageUrl] Вызов:', {
        input: imagePath,
        type: typeof imagePath,
        startsWithHttp: imagePath?.startsWith('http'),
        API_BASE_URL: API_BASE_URL
    });
    
    if (!imagePath) {
        console.warn('⚠️ [getImageUrl] Пустой путь, возвращаем placeholder');
        return '/placeholder-project.jpg';
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('✅ [getImageUrl] Уже полный URL, возвращаем как есть');
        return imagePath;
    }
    
    // Убираем ведущие слеши
    const cleanPath = imagePath.replace(/^\/+/, '');
    const fullUrl = `${API_BASE_URL}/${cleanPath}`;
    
    console.log('✅ [getImageUrl] Сгенерирован URL:', fullUrl);
    return fullUrl;
};

// Экспорт для проверки в консоли
export const getApiBaseUrl = () => API_BASE_URL;
// src/utils/imageUtils.js
const API_BASE_URL = 'https://my-architecture-api.onrender.com';

export const getImageUrl = (imagePath) => {
    console.log('🖼️ getImageUrl called with:', imagePath); // Для отладки
    
    // Пустая заглушка
    if (!imagePath) {
        console.warn('⚠️ No image path provided');
        return '/placeholder-project.jpg';
    }
    
    // Если уже полный URL (начинается с http:// или https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Убираем ведущий слеш, чтобы не было двойных
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Формируем полный URL
    const fullUrl = `${API_BASE_URL}/${cleanPath}`;
    
    console.log('✅ Generated URL:', fullUrl);
    return fullUrl;
};

// Экспорт для отладки
export const getApiBaseUrl = () => API_BASE_URL;
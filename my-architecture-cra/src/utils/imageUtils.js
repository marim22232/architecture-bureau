// src/utils/imageUtils.js
const API_BASE_URL = 'https://my-architecture-api.onrender.com';

export const getImageUrl = (imagePath) => {
    // Пустая заглушка
    if (!imagePath) return '/placeholder-project.jpg';
    
    // Если уже полный URL
    if (imagePath.startsWith('http')) return imagePath;
    
    // Нормализуем путь: убираем лишние слеши в начале и добавляем один
    let normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Возвращаем полный URL
    return `${API_BASE_URL}${normalizedPath}`;
};
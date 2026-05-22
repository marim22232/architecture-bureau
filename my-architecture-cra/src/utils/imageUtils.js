// src/utils/imageUtils.js
const API_BASE_URL = 'https://my-architecture-api.onrender.com';
// Или попробуйте: 
// const API_BASE_URL = window.location.origin; // если API на том же домене

export const getImageUrl = (imagePath) => {
    console.log('️ getImageUrl called with:', imagePath); // Для отладки
    
    if (!imagePath) {
        console.warn('⚠️ No image path provided');
        return '/placeholder-project.jpg';
    }
    
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Убираем ведущий слеш если есть, чтобы не было двойных слешей
    const cleanPath = imagePath.replace(/^\/+/, '');
    const fullUrl = `${API_BASE_URL}/${cleanPath}`;
    
    console.log('✅ Full image URL:', fullUrl);
    return fullUrl;
};

// Добавьте функцию для проверки доступности изображения
export const testImageUrl = async (imagePath) => {
    const url = getImageUrl(imagePath);
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log('Image test:', {
            url,
            status: response.status,
            contentType: response.headers.get('content-type')
        });
        return response.ok;
    } catch (error) {
        console.error('Image test failed:', error);
        return false;
    }
};
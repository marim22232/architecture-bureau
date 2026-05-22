// src/utils/imageUtils.js
const API_BASE_URL = 'https://my-architecture-api.onrender.com';

export const getImageUrl = (imagePath) => {
    console.log('🔍 getImageUrl получил:', {
        значение: imagePath,
        тип: typeof imagePath,
        начинается_с_http: imagePath?.startsWith('http'),
        начинается_с_slash: imagePath?.startsWith('/'),
        длина: imagePath?.length
    });
    
    if (!imagePath) return '/placeholder-project.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const result = `${API_BASE_URL}${normalizedPath}`;
    
    console.log('✅ getImageUrl вернул:', result);
    return result;
};
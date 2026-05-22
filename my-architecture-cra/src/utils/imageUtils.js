// src/utils/imageUtils.js
const API_BASE_URL = 'https://my-architecture-api.onrender.com';

export const getImageUrl = (imagePath) => {
    // 🔥 Проверка на null/undefined
    if (!imagePath || imagePath === null || imagePath === undefined) {
        console.warn('⚠️ getImageUrl: null путь');
        // Вместо '/placeholder-project.jpg' используйте data URI:
return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    
    // 🔥 Проверка что это строка
    if (typeof imagePath !== 'string') {
        console.error('❌ imagePath не строка:', typeof imagePath, imagePath);
        // Вместо '/placeholder-project.jpg' используйте data URI:
return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    
    console.log('🔍 getImageUrl получил:', {
        значение: imagePath,
        тип: typeof imagePath,
        начинается_с_http: imagePath?.startsWith('http'),
    });
    
    if (imagePath.startsWith('http')) return imagePath;
    
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const result = `${API_BASE_URL}${normalizedPath}`;
    
    console.log('✅ getImageUrl вернул:', result);
    return result;
};
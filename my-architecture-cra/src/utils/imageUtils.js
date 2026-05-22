// src/utils/imageUtils.js
const API_BASE_URL = 'https://my-architecture-api.onrender.com';

export const getImageUrl = (imagePath) => {
    console.log('🔍 getImageUrl получил:', {
        значение: imagePath,
        тип: typeof imagePath
    });
    
    // ✅ ОБРАБОТКА ОБЪЕКТА
    if (imagePath && typeof imagePath === 'object') {
        console.log('⚠️ Это объект, пытаемся извлечь URL');
        
        // Пробуем разные варианты:
        const possibleUrls = [
            imagePath.url,
            imagePath.image_url,
            imagePath.src,
            imagePath.path,
            imagePath.main_image
        ];
        
        for (const url of possibleUrls) {
            if (url && typeof url === 'string') {
                console.log(`✅ Нашли URL в поле: ${url}`);
                imagePath = url;
                break;
            }
        }
        
        // Если не нашли URL
        if (typeof imagePath !== 'string') {
            console.error('❌ Не удалось извлечь URL из объекта:', imagePath);
            return '/placeholder-project.jpg';
        }
    }
    
    // Если всё еще не строка
    if (typeof imagePath !== 'string') {
        console.error('❌ imagePath не является строкой:', imagePath);
        return '/placeholder-project.jpg';
    }
    
    // Пустая строка
    if (!imagePath || imagePath.trim() === '') {
        return '/placeholder-project.jpg';
    }
    
    // Полный URL
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Относительный путь
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const result = `${API_BASE_URL}${normalizedPath}`;
    
    console.log('✅ getImageUrl вернул:', result);
    return result;
};
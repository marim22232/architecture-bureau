// my-architecture-api/middleware/errorHandler.js
import { AppError, ErrorTypes } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
    console.error('❌ Ошибка:', err);
    
    // Если это наша кастомная ошибка
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                type: err.type,
                message: err.message,
                details: err.details
            }
        });
    }
    
    // Ошибка валидации Joi/express-validator (пример)
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                type: ErrorTypes.VALIDATION_ERROR,
                message: 'Ошибка валидации данных',
                details: err.details || err.message
            }
        });
    }
    
    // Ошибка JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                type: 'INVALID_TOKEN',
                message: 'Недействительный токен авторизации'
            }
        });
    }
    
    // Ошибка базы данных (PostgreSQL)
    if (err.code && err.code.startsWith('23')) {
        // Нарушение уникальности
        if (err.code === '23505') {
            const constraint = err.constraint;
            if (constraint && constraint.includes('email')) {
                return res.status(409).json({
                    success: false,
                    error: {
                        type: ErrorTypes.USER_EXISTS,
                        message: 'Пользователь с таким email уже существует'
                    }
                });
            }
            if (constraint && constraint.includes('phone')) {
                return res.status(409).json({
                    success: false,
                    error: {
                        type: ErrorTypes.USER_EXISTS,
                        message: 'Пользователь с таким телефоном уже существует'
                    }
                });
            }
        }
        
        return res.status(400).json({
            success: false,
            error: {
                type: ErrorTypes.DATABASE_ERROR,
                message: 'Ошибка при работе с базой данных'
            }
        });
    }
    
    // Неизвестная ошибка
    res.status(500).json({
        success: false,
        error: {
            type: ErrorTypes.INTERNAL_ERROR,
            message: process.env.NODE_ENV === 'development' 
                ? err.message 
                : 'Произошла внутренняя ошибка сервера'
        }
    });
};

// Middleware для обработки несуществующих маршрутов
export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            type: 'NOT_FOUND',
            message: `Маршрут ${req.method} ${req.originalUrl} не найден`
        }
    });
};
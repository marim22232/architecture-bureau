// my-architecture-api/middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Загружаем .env в middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

// ВАЖНО: НЕ создавайте временный ключ, а выбрасывайте ошибку
if (!JWT_SECRET) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не задан в .env файле!');
    console.error('   Добавьте JWT_SECRET=ваш_ключ в файл .env');
    // Не используем временный ключ!
}

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: {
                    type: 'UNAUTHORIZED',
                    message: 'Доступ запрещён. Токен не предоставлен.'
                }
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: {
                    type: 'TOKEN_EXPIRED',
                    message: 'Сессия истекла. Войдите снова.'
                }
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                error: {
                    type: 'INVALID_TOKEN',
                    message: 'Недействительный токен.'
                }
            });
        }
        
        return res.status(500).json({ 
            success: false,
            error: {
                type: 'INTERNAL_ERROR',
                message: 'Ошибка проверки токена.'
            }
        });
    }
};

export const optionalAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
    } catch (error) {
        // Игнорируем ошибки
    }
    next();
};

export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            error: {
                type: 'FORBIDDEN',
                message: 'Доступ запрещен. Требуются права администратора.'
            }
        });
    }
    next();
};

// Добавьте эту функцию в конец файла auth.js
export const clientOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: {
                    type: 'UNAUTHORIZED',
                    message: 'Требуется авторизация'
                }
            });
        }
        
        // Проверяем, что пользователь - клиент (имеет запись в таблице clients)
        const result = await req.pool.query(
            `SELECT c.client_id, c.first_name, c.last_name 
             FROM clients c
             WHERE c.accaunt_id = $1`,
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(403).json({ 
                success: false,
                error: {
                    type: 'FORBIDDEN',
                    message: 'Только клиенты могут оставлять отзывы'
                }
            });
        }
        
        // Добавляем информацию о клиенте в req
        req.clientInfo = {
            client_id: result.rows[0].client_id,
            full_name: `${result.rows[0].last_name || ''} ${result.rows[0].first_name || ''}`.trim(),
            first_name: result.rows[0].first_name,
            last_name: result.rows[0].last_name
        };
        
        next();
    } catch (error) {
        console.error('Ошибка в clientOnly middleware:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};
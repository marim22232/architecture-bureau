// my-architecture-api/config/initDb.js
import pool from './db.js';

export async function initializeDatabase() {
    try {
        // Создаем таблицу ролей, если ее нет
        await pool.query(`
            CREATE TABLE IF NOT EXISTS role (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Добавляем базовые роли
        await pool.query(`
            INSERT INTO role (name) VALUES ('user'), ('admin')
            ON CONFLICT (name) DO NOTHING
        `);
        
        console.log('✅ Таблица ролей инициализирована');
        
        // Проверяем JWT_SECRET
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-key-change-this-please-change-in-production') {
            console.error('❌ ВНИМАНИЕ: Используется ненадежный JWT_SECRET!');
            if (process.env.NODE_ENV === 'production') {
                throw new Error('JWT_SECRET must be changed in production!');
            }
        }
        
        console.log('✅ База данных готова к работе');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error);
        throw error;
    }
}
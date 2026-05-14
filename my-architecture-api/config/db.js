// my-architecture-api/config/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // увеличил до 5 секунд
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Логирование запросов в development режиме
if (process.env.NODE_ENV === 'development') {
    pool.on('connect', () => {
        console.log('🔌 Новое подключение к PostgreSQL');
    });
}

pool.on('error', (err) => {
    console.error('❌ Неожиданная ошибка PostgreSQL:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.error('   Убедитесь, что PostgreSQL запущен и доступен');
    }
});

// Функция для проверки подключения с повторными попытками
export const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW() as now, version() as version');
            console.log('✅ PostgreSQL подключена успешно');
            console.log(`   Версия: ${result.rows[0].version.split(',')[0]}`);
            console.log(`   Время: ${result.rows[0].now}`);
            client.release();
            return true;
        } catch (err) {
            console.error(`❌ Попытка ${i + 1}/${retries} подключения к БД не удалась:`, err.message);
            if (i < retries - 1) {
                console.log('   Повторная попытка через 2 секунды...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    console.error('❌ Не удалось подключиться к PostgreSQL после нескольких попыток');
    return false;
};

export default pool;
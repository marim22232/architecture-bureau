// my-architecture-api/app.js
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import router from './routes/index.js';
import pool from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

// CORS
//app.use(cors());
app.use(cors({
    origin: [
        'https://architecture-bureau-tcn4-ngfdi2za2.vercel.app',
        'http://localhost:3000',
        '*' // Для всех доменов (можно оставить для теста)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// JSON парсер
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
}));

// Добавляем pool в контекст запроса
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString()
    });
});

// Маршруты API
app.use('/api', router);

// Создаем папки для загрузок
const uploadDirs = ['uploads', 'uploads/projects', 'uploads/team', 'uploads/partners', 'uploads/awards'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Создана папка: ${dir}`);
    }
});

// 404 обработчик
app.use(notFound);

// Обработчик ошибок
app.use(errorHandler);
// CORS - расширенная настройка
app.use(cors({
    origin: [
        'https://architecture-bureau-tcn4-ngfdi2za2.vercel.app',
        'https://architecture-bureau-tcn4.vercel.app',
        'http://localhost:3000',
        '*'  // Для всех доменов
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Статические файлы с CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=31536000');
    }
}));
export default app;
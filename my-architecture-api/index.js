// my-architecture-api/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ ЗАГРУЗКА .env - САМАЯ ПЕРВАЯ СТРОКА!
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Проверка загрузки
console.log('🔍 Загрузка .env из:', path.join(__dirname, '.env'));
console.log('📧 JWT_SECRET:', process.env.JWT_SECRET ? '✅ ЗАГРУЖЕН' : '❌ НЕ ЗАГРУЖЕН');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 SERVER STARTED ON PORT ${PORT}`);
});
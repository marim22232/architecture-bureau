// config/envCheck.js
import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
];

console.log('🔍 Проверка переменных окружения:\n');

let allPresent = true;
requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value && varName.includes('SECRET') ? '********' : value || 'ОТСУТСТВУЕТ';
    console.log(`   ${status} ${varName}: ${displayValue}`);
    if (!value) allPresent = false;
});

console.log('');
if (allPresent) {
    console.log('✅ Все переменные окружения настроены правильно!\n');
} else {
    console.log('❌ Некоторые переменные отсутствуют. Проверьте .env файл\n');
}

export default allPresent;
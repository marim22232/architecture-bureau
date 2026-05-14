import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'НЕ ЗАДАН');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Ошибка подключения к SMTP:', error);
    } else {
        console.log('✅ SMTP подключен успешно!');
        
        // Отправляем тестовое письмо себе
        transporter.sendMail({
            from: `"M&Y Architecture" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'Тестовое письмо',
            text: 'Если вы читаете это, SMTP работает!'
        }).then(() => {
            console.log('✅ Тестовое письмо отправлено!');
        }).catch(err => {
            console.error('❌ Ошибка отправки тестового письма:', err);
        });
    }
});
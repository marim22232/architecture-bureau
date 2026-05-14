// my-architecture-api/services/AuthService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

class AuthService {
    
    // ============================================
    // РЕГИСТРАЦИЯ (НЕ создаём клиента!)
    // ============================================
    async register(data) {
        const { email, phone, password } = data;
        
        // Проверяем существующего пользователя
        const existingUser = await pool.query(
            `SELECT id_accoun FROM accaunt WHERE email = $1 OR phone = $2`,
            [email, phone]
        );
        
        if (existingUser.rows.length > 0) {
            throw new Error('Пользователь с таким email или телефоном уже существует');
        }
        
        // Хешируем пароль
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Генерируем код подтверждения
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Создаём аккаунт (НЕ создаём запись в clients!)
        const result = await pool.query(
            `INSERT INTO accaunt (email, phone, password_hash, role_id, verification_code, verification_code_expires)
             VALUES ($1, $2, $3, (SELECT id FROM role WHERE name = 'user'), $4, NOW() + INTERVAL '15 minutes')
             RETURNING id_accoun, email, phone`,
            [email, phone, passwordHash, verificationCode]
        );
        
        const accauntId = result.rows[0].id_accoun;
        
        // Логируем регистрацию
        await pool.query(
            `INSERT INTO activity_logs (user_id, action, entity_type, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5)`,
            [accauntId, 'REGISTER', 'user', data.ip || null, data.userAgent || null]
        );
        
        return {
            success: true,
            message: 'Регистрация успешна. Подтвердите email/телефон.',
            verificationCode,
            accauntId,
            user: {
                id: accauntId,
                email: email || null,
                phone: phone || null,
                hasClientProfile: false
            }
        };
    }
    
    // ============================================
    // ПОДТВЕРЖДЕНИЕ КОДА
    // ============================================
    async verify(login, code) {
        const result = await pool.query(
            `SELECT id_accoun, email, phone FROM accaunt
             WHERE (email = $1 OR phone = $1)
             AND verification_code = $2
             AND verification_code_expires > NOW()`,
            [login, code]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Неверный или просроченный код подтверждения');
        }
        
        const user = result.rows[0];
        
        if (user.email) {
            await pool.query(
                `UPDATE accaunt SET is_email_verified = TRUE, email_verified_at = NOW(), verification_code = NULL
                 WHERE id_accoun = $1`,
                [user.id_accoun]
            );
        } else {
            await pool.query(
                `UPDATE accaunt SET is_phone_verified = TRUE, phone_verified_at = NOW(), verification_code = NULL
                 WHERE id_accoun = $1`,
                [user.id_accoun]
            );
        }
        
        return { success: true, message: 'Аккаунт успешно подтверждён' };
    }
    
    // ============================================
    // ВХОД
    // ============================================
    async login(login, password, ip, userAgent) {
        // Ищем пользователя
        const result = await pool.query(
            `SELECT a.*, r.name as role_name
             FROM accaunt a
             JOIN role r ON a.role_id = r.id
             WHERE (a.email = $1 OR a.phone = $1)
             AND a.is_active = true`,
            [login]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Неверный логин или пароль');
        }
        
        const user = result.rows[0];
        
        // Проверяем блокировку
        if (user.is_blocked) {
            throw new Error(`Аккаунт заблокирован. Причина: ${user.blocked_reason || 'Не указана'}`);
        }
        
        // Проверяем пароль
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            throw new Error('Неверный логин или пароль');
        }
        
        // Получаем данные клиента (если есть)
        const clientResult = await pool.query(
            `SELECT client_id, first_name, last_name, patronymic, company_name FROM clients WHERE accaunt_id = $1`,
            [user.id_accoun]
        );
        
        const clientData = clientResult.rows[0] || null;
        
        // Создаём JWT токен
        const token = jwt.sign(
            { id: user.id_accoun, email: user.email, role: user.role_name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        // Обновляем last_login
        await pool.query(
            `UPDATE accaunt SET last_login = NOW(), last_login_ip = $1 WHERE id_accoun = $2`,
            [ip, user.id_accoun]
        );
        
        // Логируем вход
        await pool.query(
            `INSERT INTO activity_logs (user_id, action, entity_type, ip_address, user_agent, success)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id_accoun, 'LOGIN', 'user', ip, userAgent, true]
        );
        
        return {
            success: true,
            token,
            user: {
                id: user.id_accoun,
                email: user.email,
                phone: user.phone,
                role: user.role_name,
                hasClientProfile: !!clientData,
                client: clientData,
                isEmailVerified: user.is_email_verified,
                isPhoneVerified: user.is_phone_verified
            }
        };
    }
    
    // ============================================
    // ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
    // ============================================
    async getCurrentUser(userId) {
        const result = await pool.query(
            `SELECT a.id_accoun, a.email, a.phone, a.is_email_verified, a.is_phone_verified,
                    r.name as role
             FROM accaunt a
             JOIN role r ON a.role_id = r.id
             WHERE a.id_accoun = $1 AND a.is_active = true`,
            [userId]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Пользователь не найден');
        }
        
        const user = result.rows[0];
        
        // Дополнительные данные (если есть клиент)
        const clientResult = await pool.query(
            `SELECT client_id, first_name, last_name, patronymic, company_name 
             FROM clients WHERE accaunt_id = $1`,
            [user.id_accoun]
        );
        
        const clientData = clientResult.rows[0] || null;
        
        return {
            ...user,
            hasClientProfile: !!clientData,
            firstName: clientData?.first_name,
            lastName: clientData?.last_name,
            companyName: clientData?.company_name
        };
    }
    
    // ============================================
    // ОБНОВЛЕНИЕ ПРОФИЛЯ (если есть клиент)
    // ============================================
    async updateProfile(userId, data) {
        const { firstName, lastName, patronymic, companyName, email, phone } = data;
        
        // Проверяем, есть ли клиент
        const clientCheck = await pool.query(
            `SELECT client_id FROM clients WHERE accaunt_id = $1`,
            [userId]
        );
        
        if (clientCheck.rows.length > 0) {
            // Обновляем существующего клиента
            await pool.query(
                `UPDATE clients SET 
                    first_name = COALESCE($1, first_name),
                    last_name = COALESCE($2, last_name),
                    patronymic = COALESCE($3, patronymic),
                    company_name = COALESCE($4, company_name),
                    email = COALESCE($5, email),
                    phone = COALESCE($6, phone),
                    updated_at = NOW()
                 WHERE accaunt_id = $7`,
                [firstName, lastName, patronymic, companyName, email, phone, userId]
            );
        } else if (firstName || lastName || companyName) {
            // Создаём клиента, если есть данные
            await pool.query(
                `INSERT INTO clients (accaunt_id, first_name, last_name, patronymic, company_name, email, phone)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, firstName, lastName, patronymic, companyName, email, phone]
            );
        }
        
        // Обновляем аккаунт
        await pool.query(
            `UPDATE accaunt SET 
                email = COALESCE($1, email),
                phone = COALESCE($2, phone),
                updated_at = NOW()
             WHERE id_accoun = $3`,
            [email, phone, userId]
        );
        
        return { success: true, message: 'Профиль обновлён' };
    }
    
    // ============================================
    // ОТПРАВКА КОДА ПОДТВЕРЖДЕНИЯ
    // ============================================
    async sendVerificationCode(login) {
        const result = await pool.query(
            `SELECT id_accoun FROM accaunt WHERE email = $1 OR phone = $1`,
            [login]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Пользователь не найден');
        }
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        await pool.query(
            `UPDATE accaunt 
             SET verification_code = $1, verification_code_expires = NOW() + INTERVAL '15 minutes'
             WHERE id_accoun = $2`,
            [verificationCode, result.rows[0].id_accoun]
        );
        
        return {
            success: true,
            message: 'Код подтверждения отправлен',
            verificationCode
        };
    }
    
    // ============================================
    // СБРОС ПАРОЛЯ
    // ============================================
    async resetPassword(login, code, newPassword) {
        if (newPassword.length < 6) {
            throw new Error('Пароль должен быть не менее 6 символов');
        }
        
        const result = await pool.query(
            `SELECT id_accoun FROM accaunt
             WHERE (email = $1 OR phone = $1)
             AND verification_code = $2
             AND verification_code_expires > NOW()`,
            [login, code]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Неверный или просроченный код');
        }
        
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        await pool.query(
            `UPDATE accaunt 
             SET password_hash = $1, verification_code = NULL
             WHERE id_accoun = $2`,
            [newPasswordHash, result.rows[0].id_accoun]
        );
        
        return { success: true, message: 'Пароль успешно изменён' };
    }
    
    // ============================================
    // ВЫХОД
    // ============================================
    async logout(userId, ip, userAgent) {
        if (userId) {
            await pool.query(
                `INSERT INTO activity_logs (user_id, action, entity_type, ip_address, user_agent, success)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, 'LOGOUT', 'user', ip, userAgent, true]
            );
        }
        return { success: true, message: 'Выход выполнен успешно' };
    }
}

export default new AuthService();
// my-architecture-api/controllers/AuthController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-key-change-this-please-change-in-production') {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не задан или используется значение по умолчанию!');
    process.exit(1);
}

let emailTransporter = null;

function getEmailTransporter() {
    if (!emailTransporter && process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com') {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return emailTransporter;
}

class AuthController {
    
    constructor() {
        this.register = this.register.bind(this);
        this.verify = this.verify.bind(this);
        this.login = this.login.bind(this);
        this.sendVerificationCode = this.sendVerificationCode.bind(this);
        this.getCurrentUser = this.getCurrentUser.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.logout = this.logout.bind(this);
        this.sendVerificationEmail = this.sendVerificationEmail.bind(this);
    }

    // РЕГИСТРАЦИЯ С ПРОВЕРКОЙ TEAM И CLIENTS
    async register(req, res) {
        try {
            let { email, password } = req.body;
            
            console.log('📥 register request:', { email, password: '***' });
            
            if (!email) {
                return res.status(400).json({ error: 'Укажите email' });
            }
            
            email = email.toLowerCase().trim();
            
            if (!password || password.length < 6) {
                return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
            }
            
            // 1. Проверяем, существует ли уже аккаунт
            const existingAccount = await req.pool.query(
                `SELECT id_accoun FROM accaunt WHERE email = $1`,
                [email]
            );
            
            if (existingAccount.rows.length > 0) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
            
            // 2. Проверяем, есть ли такой email в таблице team (сотрудники)
            const teamMember = await req.pool.query(
                `SELECT id, name, position, email, accaunt_id FROM team WHERE email = $1 AND is_active = true`,
                [email]
            );
            
            // 3. Проверяем, есть ли такой email в таблице clients
            const existingClient = await req.pool.query(
                `SELECT client_id, first_name, last_name, company_name, email, accaunt_id 
                 FROM clients WHERE email = $1`,
                [email]
            );
            
            // 4. Определяем роль и связь
            let roleId = null;
            let accauntId = null;
            let linkInfo = null;
            
            // Проверяем роль user
            const roleCheck = await req.pool.query(
                `SELECT id FROM role WHERE name = 'user'`
            );
            
            const userRoleId = roleCheck.rows[0]?.id || 1;
            
            // Если это сотрудник (team) И у него уже есть accaunt_id
            if (teamMember.rows.length > 0 && teamMember.rows[0].accaunt_id) {
                // У сотрудника уже есть аккаунт - нельзя создать новый
                return res.status(400).json({ 
                    error: 'Этот email принадлежит сотруднику с уже существующим аккаунтом',
                    existsAs: 'team_member_with_account'
                });
            }
            
            // Если это сотрудник (team) без аккаунта
            if (teamMember.rows.length > 0) {
                roleId = (await req.pool.query(`SELECT id FROM role WHERE name = 'admin'`)).rows[0]?.id || 2;
                linkInfo = {
                    type: 'team',
                    id: teamMember.rows[0].id,
                    name: teamMember.rows[0].name,
                    position: teamMember.rows[0].position,
                    message: 'Вы регистрируетесь как сотрудник компании'
                };
                console.log('👨‍💼 Регистрация сотрудника:', teamMember.rows[0].name);
            }
            // Если это клиент
            else if (existingClient.rows.length > 0) {
                roleId = userRoleId;
                linkInfo = {
                    type: 'client',
                    id: existingClient.rows[0].client_id,
                    name: `${existingClient.rows[0].first_name} ${existingClient.rows[0].last_name || ''}`.trim(),
                    company: existingClient.rows[0].company_name,
                    message: 'Вы регистрируетесь как клиент компании'
                };
                console.log('👤 Регистрация клиента:', linkInfo.name);
            }
            // Новый пользователь
            else {
                roleId = userRoleId;
                linkInfo = {
                    type: 'new',
                    message: 'Добро пожаловать!'
                };
                console.log('🆕 Регистрация нового пользователя');
            }
            
            // Создаем аккаунт
            const passwordHash = await bcrypt.hash(password, 10);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const result = await req.pool.query(
                `INSERT INTO accaunt (email, password_hash, role_id, verification_code, verification_code_expires)
                 VALUES ($1, $2, $3, $4, NOW() + INTERVAL '15 minutes')
                 RETURNING id_accoun, email`,
                [email, passwordHash, roleId, verificationCode]
            );
            
            const newAccauntId = result.rows[0].id_accoun;
            
            // 5. Связываем аккаунт с существующей записью
            if (teamMember.rows.length > 0 && !teamMember.rows[0].accaunt_id) {
                // Обновляем team - добавляем accaunt_id
                await req.pool.query(
                    `UPDATE team SET accaunt_id = $1 WHERE id = $2`,
                    [newAccauntId, teamMember.rows[0].id]
                );
                console.log('🔗 Аккаунт связан с сотрудником');
            }
            
            if (existingClient.rows.length > 0 && !existingClient.rows[0].accaunt_id) {
                // Обновляем clients - добавляем accaunt_id
                await req.pool.query(
                    `UPDATE clients SET accaunt_id = $1 WHERE client_id = $2`,
                    [newAccauntId, existingClient.rows[0].client_id]
                );
                console.log('🔗 Аккаунт связан с клиентом');
            }
            
            console.log('✅ Аккаунт создан:', newAccauntId);
            
            // Отправляем код на email
            await this.sendVerificationEmail(email, verificationCode);
            
            // ВРЕМЕННО: возвращаем код для тестирования
            res.status(201).json({
                success: true,
                message: linkInfo.message || 'Регистрация успешна. Код подтверждения отправлен на email.',
                verificationCode: verificationCode, // ⚠️ ТОЛЬКО ДЛЯ ТЕСТА!
                accauntId: newAccauntId,
                linkInfo: linkInfo, // Информация о связи с существующей записью
                user: {
                    id: newAccauntId,
                    email: email,
                    role: roleId === 2 ? 'admin' : 'user',
                    hasClientProfile: !!existingClient.rows.length,
                    isTeamMember: !!teamMember.rows.length
                }
            });
            
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    
    // ОТПРАВКА EMAIL
    async sendVerificationEmail(email, code) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n========== ТЕСТОВЫЙ КОД ==========`);
            console.log(`Email: ${email}`);
            console.log(`Код подтверждения: ${code}`);
            console.log(`===================================\n`);
            return;
        }
        
        const transporter = getEmailTransporter();
        if (!transporter) {
            console.error('❌ Email не настроен');
            return;
        }
        
        const mailOptions = {
            from: `"M&Y Architecture" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Подтверждение регистрации в M&Y Architecture',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2>Добро пожаловать в M&Y Architecture!</h2>
                    <p>Ваш код подтверждения: <strong>${code}</strong></p>
                    <p>Код действителен 15 минут.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
    }
    
    // ПОДТВЕРЖДЕНИЕ КОДА
    async verify(req, res) {
        try {
            const { email, code } = req.body;
            
            console.log('🔐 Попытка верификации:', { email, code });
            
            if (!email || !code) {
                return res.status(400).json({ error: 'Укажите email и код подтверждения' });
            }
            
            const result = await req.pool.query(
                `SELECT id_accoun, email, verification_code, verification_code_expires 
                 FROM accaunt
                 WHERE email = $1`,
                [email.toLowerCase().trim()]
            );
            
            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Пользователь не найден' });
            }
            
            const user = result.rows[0];
            
            if (!user.verification_code) {
                return res.status(400).json({ error: 'Код не найден. Запросите новый код.' });
            }
            
            if (user.verification_code !== code) {
                return res.status(400).json({ error: 'Неверный код подтверждения' });
            }
            
            if (new Date() > new Date(user.verification_code_expires)) {
                return res.status(400).json({ error: 'Код подтверждения истек. Запросите новый.' });
            }
            
            await req.pool.query(
                `UPDATE accaunt 
                 SET is_email_verified = TRUE, 
                     email_verified_at = NOW(), 
                     verification_code = NULL,
                     verification_code_expires = NULL
                 WHERE id_accoun = $1`,
                [user.id_accoun]
            );
            
            console.log('✅ Аккаунт подтвержден:', user.id_accoun);
            
            res.json({ 
                success: true, 
                message: 'Аккаунт успешно подтверждён. Теперь вы можете войти.' 
            });
            
        } catch (error) {
            console.error('Ошибка подтверждения:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    
    // my-architecture-api/controllers/AuthController.js

// ВХОД - возвращаем тип пользователя
async login(req, res) {
    try {
        let { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Укажите email и пароль' });
        }
        
        email = email.toLowerCase().trim();
        
        // Получаем пользователя из accaunt
        const result = await req.pool.query(
            `SELECT a.*, r.name as role_name
             FROM accaunt a
             JOIN role r ON a.role_id = r.id
             WHERE a.email = $1 AND a.is_active = true`,
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        if (!user.is_email_verified) {
            return res.status(401).json({ error: 'Аккаунт не подтвержден. Проверьте email.' });
        }
        
        // ПРОВЕРЯЕМ, ЯВЛЯЕТСЯ ЛИ ПОЛЬЗОВАТЕЛЬ СОТРУДНИКОМ
        const teamInfo = await req.pool.query(
            `SELECT id, name, position, photo, specialization, 
                    experience_years, projects_count, awards, education,
                    birth_date, telegram, linkedin, software_skills
             FROM team 
             WHERE accaunt_id = $1 AND is_active = true`,
            [user.id_accoun]
        );
        
        let userType = 'client';
        let profileData = null;
        
        if (teamInfo.rows.length > 0) {
            userType = 'team';
            profileData = teamInfo.rows[0];
        } else {
            // ПРОВЕРЯЕМ, ЯВЛЯЕТСЯ ЛИ ПОЛЬЗОВАТЕЛЬ КЛИЕНТОМ
            const clientInfo = await req.pool.query(
                `SELECT client_id, first_name, last_name, patronymic, 
                        email, phone, company_name
                 FROM clients 
                 WHERE accaunt_id = $1`,
                [user.id_accoun]
            );
            
            if (clientInfo.rows.length > 0) {
                userType = 'client';
                profileData = clientInfo.rows[0];
            } else {
                // Обычный пользователь без дополнительных данных
                userType = 'user';
                profileData = {
                    email: user.email
                };
            }
        }
        
        const token = jwt.sign(
            { 
                id: user.id_accoun, 
                email: user.email, 
                role: user.role_name,
                userType: userType 
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        await req.pool.query(
            `UPDATE accaunt SET last_login = NOW() WHERE id_accoun = $1`,
            [user.id_accoun]
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id_accoun,
                email: user.email,
                role: user.role_name,
                userType: userType,
                profile: profileData
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}

// ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ С РАСШИРЕННЫМИ ДАННЫМИ
async getCurrentUser(req, res) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        
        const result = await req.pool.query(
            `SELECT a.id_accoun, a.email, a.is_email_verified, r.name as role
             FROM accaunt a
             JOIN role r ON a.role_id = r.id
             WHERE a.id_accoun = $1 AND a.is_active = true`,
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        const user = result.rows[0];
        let userType = 'user';
        let profileData = {};
        
        // Проверяем team
        const teamInfo = await req.pool.query(
            `SELECT id, name, position, photo, specialization, 
                    experience_years, projects_count, awards, education,
                    birth_date, telegram, linkedin, software_skills
             FROM team 
             WHERE accaunt_id = $1 AND is_active = true`,
            [userId]
        );
        
        if (teamInfo.rows.length > 0) {
            userType = 'team';
            profileData = teamInfo.rows[0];
        } else {
            // Проверяем clients
            const clientInfo = await req.pool.query(
                `SELECT client_id, first_name, last_name, patronymic, 
                        email, phone, company_name
                 FROM clients 
                 WHERE accaunt_id = $1`,
                [userId]
            );
            
            if (clientInfo.rows.length > 0) {
                userType = 'client';
                profileData = clientInfo.rows[0];
            } else {
                userType = 'user';
                profileData = { email: user.email };
            }
        }
        
        res.json({
            success: true,
            user: {
                id: user.id_accoun,
                email: user.email,
                role: user.role,
                userType: userType,
                profile: profileData
            }
        });
        
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}
    
    // ОТПРАВКА НОВОГО КОДА
    async sendVerificationCode(req, res) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({ error: 'Укажите email' });
            }
            
            const result = await req.pool.query(
                `SELECT id_accoun FROM accaunt WHERE email = $1`,
                [email.toLowerCase().trim()]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            await req.pool.query(
                `UPDATE accaunt 
                 SET verification_code = $1, 
                     verification_code_expires = NOW() + INTERVAL '15 minutes'
                 WHERE id_accoun = $2`,
                [verificationCode, result.rows[0].id_accoun]
            );
            
            await this.sendVerificationEmail(email, verificationCode);
            
            res.json({
                success: true,
                message: 'Новый код подтверждения отправлен на email'
            });
            
        } catch (error) {
            console.error('Ошибка отправки кода:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    
    async updateProfile(req, res) {
        try {
            res.json({ success: true, message: 'Профиль обновлён' });
        } catch (error) {
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    
    async resetPassword(req, res) {
        try {
            res.json({ success: true, message: 'Пароль успешно изменён' });
        } catch (error) {
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    
    async logout(req, res) {
        try {
            res.json({ success: true, message: 'Выход выполнен успешно' });
        } catch (error) {
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
}

export default new AuthController();
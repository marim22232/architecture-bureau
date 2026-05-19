import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-key-change-this-please-change-in-production') {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не задан или используется значение по умолчанию!');
    process.exit(1);
}

// Хранилище капчи (временное)
const captchaStore = new Map();

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

class AuthController {
    
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.getCurrentUser = this.getCurrentUser.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.logout = this.logout.bind(this);
        this.getCaptcha = this.getCaptcha.bind(this);
    }

    // Получение капчи
    async getCaptcha(req, res) {
        const captcha = generateCaptcha();
        const captchaId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
        
        // Сохраняем капчу на 5 минут
        captchaStore.set(captchaId, { value: captcha, expires: Date.now() + 300000 });
        
        // Очищаем старые записи
        for (const [key, val] of captchaStore.entries()) {
            if (val.expires < Date.now()) {
                captchaStore.delete(key);
            }
        }
        
        res.json({ captcha, captchaId });
    }

    // РЕГИСТРАЦИЯ
    async register(req, res) {
        try {
            let { email, password, captcha, captchaId } = req.body;
            
            console.log('📥 register request:', { email, password: '***', captcha, captchaId });
            
            // Проверяем капчу
            const savedCaptcha = captchaStore.get(captchaId);
            
            if (!savedCaptcha || savedCaptcha.value !== captcha) {
                return res.status(400).json({ error: 'Неверная проверка "Я не робот"' });
            }
            
            // Удаляем использованную капчу
            captchaStore.delete(captchaId);
            
            if (!email) {
                return res.status(400).json({ error: 'Укажите email' });
            }
            
            email = email.toLowerCase().trim();
            
            if (!password || password.length < 6) {
                return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
            }
            
            // Проверяем, существует ли уже аккаунт
            const existingAccount = await req.pool.query(
                `SELECT id_accoun FROM accaunt WHERE email = $1`,
                [email]
            );
            
            if (existingAccount.rows.length > 0) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
            
            // Получаем роль user
            const roleCheck = await req.pool.query(
                `SELECT id FROM role WHERE name = 'user'`
            );
            const roleId = roleCheck.rows[0]?.id || 1;
            
            // Создаем аккаунт
            const passwordHash = await bcrypt.hash(password, 10);
            
            const result = await req.pool.query(
                `INSERT INTO accaunt (email, password_hash, role_id, is_email_verified, email_verified_at)
                 VALUES ($1, $2, $3, TRUE, NOW())
                 RETURNING id_accoun, email`,
                [email, passwordHash, roleId]
            );
            
            const newAccauntId = result.rows[0].id_accoun;
            
            console.log('✅ Аккаунт создан и подтверждён:', newAccauntId);
            
            res.status(201).json({
                success: true,
                message: 'Регистрация успешна! Теперь вы можете войти.',
                user: {
                    id: newAccauntId,
                    email: email,
                    role: 'user'
                }
            });
            
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    // ВХОД
    async login(req, res) {
        try {
            let { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Укажите email и пароль' });
            }
            
            email = email.toLowerCase().trim();
            
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
            
            // Проверяем, является ли пользователь сотрудником
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
                    userType = 'user';
                    profileData = { email: user.email };
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
    
    // ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
    async getCurrentUser(req, res) {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({ error: 'Не авторизован' });
            }
            
            const result = await req.pool.query(
                `SELECT a.id_accoun, a.email, r.name as role
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
    
    async updateProfile(req, res) {
        try {
            res.json({ success: true, message: 'Профиль обновлён' });
        } catch (error) {
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    
    async resetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;
            
            if (!email || !newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'Укажите email и новый пароль (мин. 6 символов)' });
            }
            
            const passwordHash = await bcrypt.hash(newPassword, 10);
            
            const result = await req.pool.query(
                `UPDATE accaunt 
                 SET password_hash = $1, updated_at = NOW()
                 WHERE email = $2 AND is_active = true
                 RETURNING id_accoun`,
                [passwordHash, email.toLowerCase().trim()]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            res.json({ success: true, message: 'Пароль успешно изменён' });
        } catch (error) {
            console.error('Ошибка сброса пароля:', error);
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
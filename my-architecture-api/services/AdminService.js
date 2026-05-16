import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

class AdminService {

    getEmailTransporter() {
        if (!this.transporter && process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: process.env.SMTP_PORT === '465', // ← для Яндекса будет true
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }
        return this.transporter;
    }

    // Отправка приглашения клиенту
    async sendInvitationEmail(email, tempPassword, firstName) {
        const transporter = this.getEmailTransporter();

        // Ссылка для установки пароля
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}&code=${tempPassword}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3a5a6a;">Добро пожаловать в M&Y Architecture!</h2>
                
                <p>Здравствуйте, ${firstName || 'Клиент'}!</p>
                
                <p>Для вас был создан аккаунт в системе архитектурного бюро M&Y Architecture.</p>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Ваши данные для входа:</strong></p>
                    <p>📧 Email: <strong>${email}</strong></p>
                    <p>🔑 Временный пароль: <strong>${tempPassword}</strong></p>
                </div>
                
                <p>Для завершения регистрации и установки постоянного пароля перейдите по ссылке:</p>
                
                <a href="${resetLink}" style="display: inline-block; background: #3a5a6a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 0;">
                    Установить пароль
                </a>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Если вы не регистрировались в нашем сервисе, проигнорируйте это письмо.
                    <br>Ссылка действительна 7 дней.
                </p>
            </div>
        `;

        const text = `
            Добро пожаловать в M&Y Architecture!
            
            Здравствуйте, ${firstName || 'Клиент'}!
            
            Для вас был создан аккаунт в системе архитектурного бюро M&Y Architecture.
            
            Ваши данные для входа:
            Email: ${email}
            Временный пароль: ${tempPassword}
            
            Для установки постоянного пароля перейдите по ссылке: ${resetLink}
            
            Ссылка действительна 7 дней.
        `;

        // В production режиме отправляем реальное письмо
        if (transporter && process.env.NODE_ENV === 'production') {
            await transporter.sendMail({
                from: `"M&Y Architecture" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Приглашение в M&Y Architecture',
                html: html,
                text: text
            });
            console.log('✅ Приглашение отправлено на:', email);
        } else {
            // В development режиме выводим в консоль
            console.log('\n========== 📧 ПРИГЛАШЕНИЕ КЛИЕНТА ==========');
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Временный пароль: ${tempPassword}`);
            console.log(`🔗 Ссылка для установки пароля: ${resetLink}`);
            console.log('============================================\n');
        }
    }

    // my-architecture-api/services/AdminService.js
    // Найди метод getAllAccounts и замени его на этот:

    async getAllAccounts(filters = {}) {
        const { type, search } = filters;

        let query = `
        SELECT 
            a.id_accoun,
            a.email,
            a.role_id,
            r.name as role_name,
            a.is_active,
            a.is_email_verified,
            a.created_at,
            a.last_login,
            c.client_id,
            c.first_name as client_first_name,
            c.last_name as client_last_name,
            c.patronymic as client_patronymic,
            c.company_name,
            c.phone as client_phone,
            t.id as team_id,
            t.name as team_name,
            t.position as team_position,
            t.specialization as team_specialization,
            t.phone as team_phone,
            t.bio as team_bio
        FROM accaunt a
        LEFT JOIN role r ON a.role_id = r.id
        LEFT JOIN clients c ON a.id_accoun = c.accaunt_id
        LEFT JOIN team t ON a.id_accoun = t.accaunt_id
        WHERE 1=1
    `;

        const params = [];
        let paramIndex = 1;

        if (type === 'client') {
            query += ` AND c.client_id IS NOT NULL`;
        } else if (type === 'team') {
            query += ` AND t.id IS NOT NULL`;
        } else if (type === 'user') {
            query += ` AND c.client_id IS NULL AND t.id IS NULL`;
        }

        if (search) {
            query += ` AND (
            a.email ILIKE $${paramIndex} OR
            c.first_name ILIKE $${paramIndex} OR
            c.last_name ILIKE $${paramIndex} OR
            c.company_name ILIKE $${paramIndex} OR
            t.name ILIKE $${paramIndex}
        )`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY a.created_at DESC`;

        const result = await pool.query(query, params);

        return result.rows.map(row => ({
            id: row.id_accoun,
            email: row.email,
            role: { id: row.role_id, name: row.role_name },
            isActive: row.is_active,
            isEmailVerified: row.is_email_verified,
            createdAt: row.created_at,
            lastLogin: row.last_login,
            profile: row.client_id ? {
                type: 'client',
                id: row.client_id,
                firstName: row.client_first_name,
                lastName: row.client_last_name,
                patronymic: row.client_patronymic,     // ← ДОБАВЛЕНО
                fullName: `${row.client_first_name || ''} ${row.client_last_name || ''}`.trim(),
                companyName: row.company_name,
                phone: row.client_phone
            } : row.team_id ? {
                type: 'team',
                id: row.team_id,
                name: row.team_name,
                position: row.team_position,
                specialization: row.team_specialization,  // ← ДОБАВЛЕНО
                phone: row.team_phone,
                bio: row.team_bio                        // ← ДОБАВЛЕНО
            } : { type: 'user', id: null }
        }));
    }

    async getAccountById(accountId) {
        const result = await pool.query(
            `SELECT 
            a.id_accoun, a.email, a.role_id, a.is_active, a.is_email_verified,
            c.client_id, c.first_name, c.last_name, c.patronymic, c.company_name, c.phone as client_phone,
            t.id as team_id, t.name as team_name, t.position, t.specialization, t.phone as team_phone,
            t.email as team_email, t.bio, t.photo
         FROM accaunt a
         LEFT JOIN clients c ON a.id_accoun = c.accaunt_id
         LEFT JOIN team t ON a.id_accoun = t.accaunt_id
         WHERE a.id_accoun = $1`,
            [accountId]
        );

        if (result.rows.length === 0) return null;

        const row = result.rows[0];

        let profile = null;
        if (row.client_id) {
            profile = {
                type: 'client',
                id: row.client_id,
                firstName: row.first_name,
                lastName: row.last_name,
                patronymic: row.patronymic,
                companyName: row.company_name,
                phone: row.client_phone
            };
        } else if (row.team_id) {
            profile = {
                type: 'team',
                id: row.team_id,
                name: row.team_name,
                position: row.position,
                specialization: row.specialization,
                phone: row.team_phone,
                email: row.team_email,
                bio: row.bio,
                photo: row.photo
            };
        } else {
            profile = { type: 'user', id: null };
        }

        return {
            id: row.id_accoun,
            email: row.email,
            roleId: row.role_id,
            isActive: row.is_active,
            isEmailVerified: row.is_email_verified,
            profile
        };
    }

    async updateAccount(accountId, data) {
        const { roleId, isActive, isEmailVerified } = data;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (roleId !== undefined) {
            updates.push(`role_id = $${paramIndex++}`);
            values.push(roleId);
        }
        if (isActive !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(isActive);
        }
        if (isEmailVerified !== undefined) {
            updates.push(`is_email_verified = $${paramIndex++}`);
            values.push(isEmailVerified);
        }

        if (updates.length === 0) return false;

        values.push(accountId);

        await pool.query(
            `UPDATE accaunt SET ${updates.join(', ')} WHERE id_accoun = $${paramIndex}`,
            values
        );

        return true;
    }

    async updateClient(clientId, data) {
        const { firstName, lastName, patronymic, companyName, phone } = data;

        const result = await pool.query(
            `UPDATE clients 
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 patronymic = COALESCE($3, patronymic),
                 company_name = COALESCE($4, company_name),
                 phone = COALESCE($5, phone),
                 updated_at = NOW()
             WHERE client_id = $6
             RETURNING *`,
            [firstName, lastName, patronymic, companyName, phone, clientId]
        );

        return result.rows[0] || null;
    }

    async updateTeam(teamId, data) {
        const { name, position, specialization, phone, email, bio } = data;

        const result = await pool.query(
            `UPDATE team 
         SET name = COALESCE($1, name),
             position = COALESCE($2, position),
             specialization = COALESCE($3, specialization),
             phone = COALESCE($4, phone),
             email = COALESCE($5, email),
             bio = COALESCE($6, bio),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
            [name, position, specialization, phone, email, bio, teamId]
        );

        return result.rows[0] || null;
    }

    async createClientWithAccount(data) {
        const { email, firstName, lastName, patronymic, companyName, phone } = data;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const existingAccount = await client.query(
                `SELECT id_accoun FROM accaunt WHERE email = $1`,
                [email.toLowerCase()]
            );

            let accountId;
            let tempPassword = null;
            let isNewAccount = false;

            if (existingAccount.rows.length > 0) {
                accountId = existingAccount.rows[0].id_accoun;
                console.log('📧 Аккаунт уже существует, связываем с клиентом');
            } else {
                // Генерируем временный пароль
                tempPassword = Math.random().toString(36).slice(-8);
                const passwordHash = await bcrypt.hash(tempPassword, 10);

                const newAccount = await client.query(
                    `INSERT INTO accaunt (email, password_hash, role_id, is_email_verified, created_at)
                 VALUES ($1, $2, (SELECT id FROM role WHERE name = 'user'), false, NOW())
                 RETURNING id_accoun`,
                    [email.toLowerCase(), passwordHash]
                );
                accountId = newAccount.rows[0].id_accoun;
                isNewAccount = true;
                console.log('✅ Создан новый аккаунт с ID:', accountId);
            }

            // Проверяем, есть ли уже клиент с таким accaunt_id
            const existingClient = await client.query(
                `SELECT client_id FROM clients WHERE accaunt_id = $1`,
                [accountId]
            );

            let newClient;
            if (existingClient.rows.length > 0) {
                // Обновляем существующего клиента
                newClient = await client.query(
                    `UPDATE clients 
                 SET first_name = COALESCE($1, first_name),
                     last_name = COALESCE($2, last_name),
                     patronymic = COALESCE($3, patronymic),
                     company_name = COALESCE($4, company_name),
                     email = COALESCE($5, email),
                     phone = COALESCE($6, phone),
                     updated_at = NOW()
                 WHERE accaunt_id = $7
                 RETURNING *`,
                    [firstName, lastName, patronymic, companyName, email, phone, accountId]
                );
            } else {
                // Создаём нового клиента — ОБЯЗАТЕЛЬНО добавляем email!
                newClient = await client.query(
                    `INSERT INTO clients (accaunt_id, first_name, last_name, patronymic, company_name, email, phone)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                    [accountId, firstName, lastName, patronymic, companyName, email, phone]
                );
            }

            await client.query('COMMIT');

            // Отправляем email с приглашением (только если создали новый аккаунт)
            if (isNewAccount && tempPassword) {
                await this.sendInvitationEmail(email, tempPassword, firstName);
            } else if (!isNewAccount) {
                console.log('📧 Аккаунт уже существовал, email с приглашением не отправлен');
            }

            return {
                success: true,
                accountId,
                client: newClient.rows[0],
                isNewAccount,
                emailSent: isNewAccount
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Ошибка создания клиента:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getTeamSecureData(teamId, teamName) {
        try {
            console.log('🔍 Поиск данных для teamId:', teamId);

            // Прямой поиск в team_secure_view по team_id (это внешний ключ)
            const result = await pool.query(
                `SELECT 
                team_id,
                marriage_status,
                children_count,
                passport_data,
                inn,
                snils,
                registration_address,
                actual_address,
                birth_place,
                medical_info,
                bank_details,
                contract_info,
                vacation_days_remaining,
                sick_days_this_year,
                emergency_contact
             FROM team_secure_view 
             WHERE team_id = $1`,
                [teamId]
            );

            console.log('📊 Результат запроса team_secure:', result.rows.length, 'записей');

            if (result.rows.length === 0) {
                console.log('⚠️ Данные не найдены для teamId:', teamId);
                return null;
            }

            return {
                teamName: teamName,
                ...result.rows[0]
            };
        } catch (error) {
            console.error('❌ Ошибка получения данных сотрудника:', error);
            throw error;
        }
    }

    // Получить расшифрованные данные клиента
    async getClientSecureData(clientId, clientName) {
        try {
            // Используем представление clients_secure_view (оно уже расшифровывает данные)
            const result = await pool.query(
                `SELECT 
                client_id,
                birth_date,
                passport_data,
                inn,
                snils,
                registration_address,
                actual_address,
                birth_place,
                bank_details,
                contract_info,
                notes
             FROM clients_secure_view 
             WHERE client_id = $1`,
                [clientId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return {
                clientName: clientName,
                ...result.rows[0]
            };
        } catch (error) {
            console.error('❌ Ошибка получения данных клиента:', error);
            throw error;
        }
    }

    // my-architecture-api/services/AdminService.js
    // Добавь эти методы в конец класса AdminService

    // Создание приватных данных сотрудника
    async createTeamSecureData(teamId, data) {
        const {
            passport_data, inn, snils,
            registration_address, actual_address, birth_place,
            marriage_status, children_count,
            medical_info, bank_details, contract_info,
            vacation_days_remaining, sick_days_this_year, emergency_contact
        } = data;

        const result = await pool.query(
            `INSERT INTO team_secure (
            team_id, marriage_status, children_count,
            passport_data, inn, snils,
            registration_address, actual_address, birth_place,
            medical_info, bank_details, contract_info,
            vacation_days_remaining, sick_days_this_year, emergency_contact
        ) VALUES (
            $1, $2, $3,
            pgp_sym_encrypt($4, 'momol050505'),
            pgp_sym_encrypt($5, 'momol050505'),
            pgp_sym_encrypt($6, 'momol050505'),
            pgp_sym_encrypt($7, 'momol050505'),
            pgp_sym_encrypt($8, 'momol050505'),
            pgp_sym_encrypt($9, 'momol050505'),
            pgp_sym_encrypt($10, 'momol050505'),
            pgp_sym_encrypt($11, 'momol050505'),
            pgp_sym_encrypt($12, 'momol050505'),
            pgp_sym_encrypt($13, 'momol050505'),
            pgp_sym_encrypt($14, 'momol050505'),
            pgp_sym_encrypt($15, 'momol050505')
        ) RETURNING id`,
            [
                teamId, marriage_status || 'single', children_count || 0,
                passport_data || '', inn || '', snils || '',
                registration_address || '', actual_address || '', birth_place || '',
                medical_info || '', bank_details || '', contract_info || '',
                vacation_days_remaining || '', sick_days_this_year || '', emergency_contact || ''
            ]
        );

        return { id: result.rows[0].id };
    }

    // Обновление приватных данных сотрудника
    async updateTeamSecureData(teamId, data) {
    const {
        passport_data, inn, snils,
        registration_address, actual_address, birth_place,
        marriage_status, children_count,
        medical_info, bank_details, contract_info,
        vacation_days_remaining, sick_days_this_year, emergency_contact
    } = data;

    console.log('📝 updateTeamSecureData вызван:', { teamId, data });
    const encryptionKey = process.env.PGP_ENCRYPTION_KEY || 'momol050505';

    // Обработка пустых значений
    const safePassport = passport_data?.trim() !== '' ? passport_data : null;
    const safeInn = inn?.trim() !== '' ? inn : null;
    const safeSnils = snils?.trim() !== '' ? snils : null;
    const safeRegistrationAddress = registration_address?.trim() !== '' ? registration_address : null;
    const safeActualAddress = actual_address?.trim() !== '' ? actual_address : null;
    const safeBirthPlace = birth_place?.trim() !== '' ? birth_place : null;
    const safeMedicalInfo = medical_info?.trim() !== '' ? medical_info : null;
    const safeBankDetails = bank_details?.trim() !== '' ? bank_details : null;
    const safeContractInfo = contract_info?.trim() !== '' ? contract_info : null;
    const safeVacationDays = vacation_days_remaining?.trim() !== '' ? vacation_days_remaining : null;
    const safeSickDays = sick_days_this_year?.trim() !== '' ? sick_days_this_year : null;
    const safeEmergencyContact = emergency_contact?.trim() !== '' ? emergency_contact : null;

    try {
        const existing = await pool.query(
            `SELECT id FROM team_secure WHERE team_id = $1`,
            [teamId]
        );

        if (existing.rows.length === 0) {
            // INSERT
            const result = await pool.query(
                `INSERT INTO team_secure (
                    team_id, marriage_status, children_count,
                    passport_data, inn, snils,
                    registration_address, actual_address, birth_place,
                    medical_info, bank_details, contract_info,
                    vacation_days_remaining, sick_days_this_year, emergency_contact
                ) VALUES (
                    $1, $2, $3,
                    CASE WHEN $4::text IS NOT NULL THEN pgp_sym_encrypt($4::text, $16) ELSE NULL END,
                    CASE WHEN $5::text IS NOT NULL THEN pgp_sym_encrypt($5::text, $16) ELSE NULL END,
                    CASE WHEN $6::text IS NOT NULL THEN pgp_sym_encrypt($6::text, $16) ELSE NULL END,
                    CASE WHEN $7::text IS NOT NULL THEN pgp_sym_encrypt($7::text, $16) ELSE NULL END,
                    CASE WHEN $8::text IS NOT NULL THEN pgp_sym_encrypt($8::text, $16) ELSE NULL END,
                    CASE WHEN $9::text IS NOT NULL THEN pgp_sym_encrypt($9::text, $16) ELSE NULL END,
                    CASE WHEN $10::text IS NOT NULL THEN pgp_sym_encrypt($10::text, $16) ELSE NULL END,
                    CASE WHEN $11::text IS NOT NULL THEN pgp_sym_encrypt($11::text, $16) ELSE NULL END,
                    CASE WHEN $12::text IS NOT NULL THEN pgp_sym_encrypt($12::text, $16) ELSE NULL END,
                    CASE WHEN $13::text IS NOT NULL THEN pgp_sym_encrypt($13::text, $16) ELSE NULL END,
                    CASE WHEN $14::text IS NOT NULL THEN pgp_sym_encrypt($14::text, $16) ELSE NULL END,
                    CASE WHEN $15::text IS NOT NULL THEN pgp_sym_encrypt($15::text, $16) ELSE NULL END
                ) RETURNING id`,
                [
                    teamId, marriage_status || 'single', children_count || 0,
                    safePassport, safeInn, safeSnils,
                    safeRegistrationAddress, safeActualAddress, safeBirthPlace,
                    safeMedicalInfo, safeBankDetails, safeContractInfo,
                    safeVacationDays, safeSickDays, safeEmergencyContact,
                    encryptionKey
                ]
            );
            return result.rows[0];
        }

        // UPDATE — 🔧 ИСПРАВЛЕННАЯ ВЕРСИЯ с ::text в WHEN
        const result = await pool.query(
            `UPDATE team_secure SET
                marriage_status = COALESCE($1, marriage_status),
                children_count = COALESCE($2, children_count),
                passport_data = CASE WHEN $3::text IS NOT NULL THEN pgp_sym_encrypt($3::text, $16) ELSE passport_data END,
                inn = CASE WHEN $4::text IS NOT NULL THEN pgp_sym_encrypt($4::text, $16) ELSE inn END,
                snils = CASE WHEN $5::text IS NOT NULL THEN pgp_sym_encrypt($5::text, $16) ELSE snils END,
                registration_address = CASE WHEN $6::text IS NOT NULL THEN pgp_sym_encrypt($6::text, $16) ELSE registration_address END,
                actual_address = CASE WHEN $7::text IS NOT NULL THEN pgp_sym_encrypt($7::text, $16) ELSE actual_address END,
                birth_place = CASE WHEN $8::text IS NOT NULL THEN pgp_sym_encrypt($8::text, $16) ELSE birth_place END,
                medical_info = CASE WHEN $9::text IS NOT NULL THEN pgp_sym_encrypt($9::text, $16) ELSE medical_info END,
                bank_details = CASE WHEN $10::text IS NOT NULL THEN pgp_sym_encrypt($10::text, $16) ELSE bank_details END,
                contract_info = CASE WHEN $11::text IS NOT NULL THEN pgp_sym_encrypt($11::text, $16) ELSE contract_info END,
                vacation_days_remaining = CASE WHEN $12::text IS NOT NULL THEN pgp_sym_encrypt($12::text, $16) ELSE vacation_days_remaining END,
                sick_days_this_year = CASE WHEN $13::text IS NOT NULL THEN pgp_sym_encrypt($13::text, $16) ELSE sick_days_this_year END,
                emergency_contact = CASE WHEN $14::text IS NOT NULL THEN pgp_sym_encrypt($14::text, $16) ELSE emergency_contact END,
                updated_at = NOW()
            WHERE team_id = $15
            RETURNING id`,
            [
                marriage_status, children_count,
                safePassport, safeInn, safeSnils,
                safeRegistrationAddress, safeActualAddress, safeBirthPlace,
                safeMedicalInfo, safeBankDetails, safeContractInfo,
                safeVacationDays, safeSickDays, safeEmergencyContact,
                teamId, encryptionKey
            ]
        );

        return result.rows[0];

    } catch (error) {
        console.error('❌ Ошибка в updateTeamSecureData:', error);
        throw error;
    }
}
    // Создание приватных данных клиента
    async createClientSecureData(clientId, data) {
        const {
            passport_data, inn, snils,
            registration_address, actual_address, birth_date, birth_place,
            bank_details, contract_info, notes
        } = data;

        const result = await pool.query(
            `INSERT INTO clients_private (
            client_id, birth_date,
            passport_data, inn, snils,
            registration_address, actual_address, birth_place,
            bank_details, contract_info, notes
        ) VALUES (
            $1, $2,
            pgp_sym_encrypt($3, 'momol050505'),
            pgp_sym_encrypt($4, 'momol050505'),
            pgp_sym_encrypt($5, 'momol050505'),
            pgp_sym_encrypt($6, 'momol050505'),
            pgp_sym_encrypt($7, 'momol050505'),
            pgp_sym_encrypt($8, 'momol050505'),
            pgp_sym_encrypt($9, 'momol050505'),
            pgp_sym_encrypt($10, 'momol050505'),
            pgp_sym_encrypt($11, 'momol050505')
        ) RETURNING id`,
            [
                clientId, birth_date || null,
                passport_data || '', inn || '', snils || '',
                registration_address || '', actual_address || '', birth_place || '',
                bank_details || '', contract_info || '', notes || ''
            ]
        );

        return { id: result.rows[0].id };
    }
    async updateClientSecureData(clientId, data) {
    const {
        passport_data, inn, snils,
        registration_address, actual_address, birth_date, birth_place,
        bank_details, contract_info, notes
    } = data;
    
    console.log('📝 updateClientSecureData вызван:', { clientId, data });
    const encryptionKey = process.env.PGP_ENCRYPTION_KEY || 'momol050505'; // 🔐 Используйте env!
    
    // Обработка пустых значений
    const safePassport = passport_data && passport_data.trim() !== '' ? passport_data : null;
    const safeInn = inn && inn.trim() !== '' ? inn : null;
    const safeSnils = snils && snils.trim() !== '' ? snils : null;
    const safeRegAddr = registration_address && registration_address.trim() !== '' ? registration_address : null;
    const safeActualAddr = actual_address && actual_address.trim() !== '' ? actual_address : null;
    const safeBirthPlace = birth_place && birth_place.trim() !== '' ? birth_place : null;
    const safeBank = bank_details && bank_details.trim() !== '' ? bank_details : null;
    const safeContract = contract_info && contract_info.trim() !== '' ? contract_info : null;
    const safeNotes = notes && notes.trim() !== '' ? notes : null;
    const safeBirthDate = birth_date && birth_date.trim() !== '' ? birth_date : null;
    
    const existing = await pool.query(
        `SELECT id FROM clients_private WHERE client_id = $1`,
        [clientId]
    );
    
    if (existing.rows.length === 0) {
        // INSERT
        const result = await pool.query(
            `INSERT INTO clients_private (
                client_id, birth_date,
                passport_data, inn, snils,
                registration_address, actual_address, birth_place,
                bank_details, contract_info, notes
            ) VALUES (
                $1, $2,
                CASE WHEN $3::text IS NOT NULL THEN pgp_sym_encrypt($3::text, $4) ELSE NULL END,
                CASE WHEN $5::text IS NOT NULL THEN pgp_sym_encrypt($5::text, $4) ELSE NULL END,
                CASE WHEN $6::text IS NOT NULL THEN pgp_sym_encrypt($6::text, $4) ELSE NULL END,
                CASE WHEN $7::text IS NOT NULL THEN pgp_sym_encrypt($7::text, $4) ELSE NULL END,
                CASE WHEN $8::text IS NOT NULL THEN pgp_sym_encrypt($8::text, $4) ELSE NULL END,
                CASE WHEN $9::text IS NOT NULL THEN pgp_sym_encrypt($9::text, $4) ELSE NULL END,
                CASE WHEN $10::text IS NOT NULL THEN pgp_sym_encrypt($10::text, $4) ELSE NULL END,
                CASE WHEN $11::text IS NOT NULL THEN pgp_sym_encrypt($11::text, $4) ELSE NULL END,
                CASE WHEN $12::text IS NOT NULL THEN pgp_sym_encrypt($12::text, $4) ELSE NULL END
            ) RETURNING id`,
            [
                clientId, safeBirthDate,
                safePassport, encryptionKey,
                safeInn, safeSnils,
                safeRegAddr, safeActualAddr, safeBirthPlace,
                safeBank, safeContract, safeNotes
            ]
        );
        console.log('✅ INSERT успешен');
        return result.rows[0];
    }
    
    // UPDATE — ИСПРАВЛЕННАЯ ВЕРСИЯ 🔧
    const result = await pool.query(
        `UPDATE clients_private SET
            birth_date = COALESCE($1, birth_date),
            passport_data = CASE WHEN $2::text IS NOT NULL THEN pgp_sym_encrypt($2::text, $3) ELSE passport_data END,
            inn = CASE WHEN $4::text IS NOT NULL THEN pgp_sym_encrypt($4::text, $3) ELSE inn END,
            snils = CASE WHEN $5::text IS NOT NULL THEN pgp_sym_encrypt($5::text, $3) ELSE snils END,
            registration_address = CASE WHEN $6::text IS NOT NULL THEN pgp_sym_encrypt($6::text, $3) ELSE registration_address END,
            actual_address = CASE WHEN $7::text IS NOT NULL THEN pgp_sym_encrypt($7::text, $3) ELSE actual_address END,
            birth_place = CASE WHEN $8::text IS NOT NULL THEN pgp_sym_encrypt($8::text, $3) ELSE birth_place END,
            bank_details = CASE WHEN $9::text IS NOT NULL THEN pgp_sym_encrypt($9::text, $3) ELSE bank_details END,
            contract_info = CASE WHEN $10::text IS NOT NULL THEN pgp_sym_encrypt($10::text, $3) ELSE contract_info END,
            notes = CASE WHEN $11::text IS NOT NULL THEN pgp_sym_encrypt($11::text, $3) ELSE notes END,
            updated_at = NOW()
        WHERE client_id = $12
        RETURNING id`,
        [
            safeBirthDate,
            safePassport, encryptionKey,
            safeInn,
            safeSnils,
            safeRegAddr,
            safeActualAddr,
            safeBirthPlace,
            safeBank,
            safeContract,
            safeNotes,
            clientId
        ]
    );
    
    console.log('✅ UPDATE успешен');
    return result.rows[0];
}
}

export default new AdminService();
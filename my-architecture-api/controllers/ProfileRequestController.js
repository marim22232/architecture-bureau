import nodemailer from 'nodemailer';

class ProfileRequestController {
    
    // Функция для отправки email (как в AuthController)
    getEmailTransporter() {
        if (!this.transporter && process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }
        return this.transporter;
    }
    
    async sendUpdateRequest(req, res) {
        try {
            const userId = req.user.id;
            const { changes, message } = req.body;
            
            console.log('📝 Запрос на изменение профиля от пользователя:', userId);
            console.log('Изменения:', changes);
            
            // 1. Получаем данные клиента
            const clientResult = await req.pool.query(
                `SELECT c.client_id, c.first_name, c.last_name, c.company_name, c.phone,
                        a.email as account_email
                 FROM clients c
                 JOIN accaunt a ON c.accaunt_id = a.id_accoun
                 WHERE c.accaunt_id = $1`,
                [userId]
            );
            
            if (clientResult.rows.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Профиль клиента не найден' 
                });
            }
            
            const client = clientResult.rows[0];
            
            // 2. Получаем email менеджера
            const managerResult = await req.pool.query(
                `SELECT email, name 
                 FROM team 
                 WHERE position ILIKE '%manager%' OR position ILIKE '%менеджер%'
                 LIMIT 1`
            );
            
            const managerEmail = managerResult.rows[0]?.email || process.env.MANAGER_EMAIL;
            
            if (!managerEmail) {
                console.error('❌ Email менеджера не найден');
                return res.status(500).json({ 
                    success: false,
                    error: 'Не удалось отправить запрос. Свяжитесь с администратором.' 
                });
            }
            
            // 3. Отправляем письмо
            const transporter = this.getEmailTransporter();
            
            const fieldLabels = {
                firstName: 'Имя',
                lastName: 'Фамилия',
                patronymic: 'Отчество',
                phone: 'Телефон',
                companyName: 'Название компании'
            };
            
            let changesText = '';
            let changesHtml = '';
            for (const [field, newValue] of Object.entries(changes)) {
                const label = fieldLabels[field] || field;
                changesText += `\n${label}: ${newValue}`;
                changesHtml += `<li><strong>${label}:</strong> ${newValue}</li>`;
            }
            
            if (transporter && process.env.NODE_ENV === 'production') {
                await transporter.sendMail({
                    from: `"M&Y Architecture" <${process.env.SMTP_USER}>`,
                    to: managerEmail,
                    subject: `📝 Запрос на изменение данных: ${client.first_name} ${client.last_name}`,
                    text: `
                        Клиент ${client.first_name} ${client.last_name} (${client.account_email}) 
                        запросил изменение данных:
                        ${changesText}
                        ${message ? `\nСообщение: ${message}` : ''}
                        
                        Для изменения данных войдите в админ-панель → Клиенты.
                    `,
                    html: `
                        <div style="font-family: Arial, sans-serif;">
                            <h2>📝 Запрос на изменение данных клиента</h2>
                            <p><strong>Клиент:</strong> ${client.first_name} ${client.last_name}</p>
                            <p><strong>Email:</strong> ${client.account_email}</p>
                            <p><strong>Телефон:</strong> ${client.phone || '—'}</p>
                            <p><strong>Компания:</strong> ${client.company_name || '—'}</p>
                            
                            <h3>Запрошенные изменения:</h3>
                            <ul>${changesHtml}</ul>
                            
                            ${message ? `<p><strong>💬 Сообщение:</strong> ${message}</p>` : ''}
                            
                            <hr>
                            <p>Войдите в админ-панель и обновите данные клиента.</p>
                        </div>
                    `
                });
                
                console.log('✅ Письмо отправлено менеджеру:', managerEmail);
            } else {
                // Тестовый режим
                console.log('\n========== ТЕСТОВЫЙ РЕЖИМ ==========');
                console.log(`📧 Письмо для менеджера (${managerEmail}):`);
                console.log(`Клиент ${client.first_name} ${client.last_name} запросил изменения:`);
                console.log(changes);
                if (message) console.log(`Сообщение: ${message}`);
                console.log('=====================================\n');
            }
            
            // 4. Логируем запрос
            await req.pool.query(
                `INSERT INTO activity_logs (user_id, action, entity_type, details, ip_address, user_agent)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, 'PROFILE_UPDATE_REQUEST', 'client', 
                 JSON.stringify({ changes, message, sentTo: managerEmail }), 
                 req.ip || null,
                 req.headers['user-agent'] || null]
            );
            
            res.json({
                success: true,
                message: 'Запрос на изменение данных отправлен менеджеру. Он свяжется с вами после проверки.'
            });
            
        } catch (error) {
            console.error('❌ Ошибка отправки запроса:', error);
            res.status(500).json({ 
                success: false,
                error: 'Не удалось отправить запрос. Попробуйте позже.' 
            });
        }
    }
}

export default new ProfileRequestController();
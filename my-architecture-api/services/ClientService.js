// services/ClientService.js
import pool from '../config/db.js';

class ClientService {
    
    // Связать аккаунт с клиентом
    async createClientFromAccount(accauntId, clientData) {
        try {
            const { firstName, lastName, patronymic, companyName, clientTypeId } = clientData;
            
            // Проверяем, существует ли аккаунт
            const accountCheck = await pool.query(
                `SELECT id_accoun, email, phone FROM accaunt WHERE id_accoun = $1 AND is_active = true`,
                [accauntId]
            );
            
            if (accountCheck.rows.length === 0) {
                return {
                    success: false,
                    error: 'Аккаунт не найден'
                };
            }
            
            const account = accountCheck.rows[0];
            
            // Проверяем, есть ли уже клиент
            const existingClient = await pool.query(
                `SELECT client_id FROM clients WHERE accaunt_id = $1`,
                [accauntId]
            );
            
            if (existingClient.rows.length > 0) {
                return {
                    success: false,
                    error: 'Клиент уже связан с этим аккаунтом'
                };
            }
            
            // Создаем клиента
            const result = await pool.query(
                `INSERT INTO clients (
                    accaunt_id, first_name, last_name, patronymic, company_name, 
                    email, phone, client_type_id, created_at, updated_at
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 1), NOW(), NOW())
                 RETURNING client_id, first_name, last_name, company_name`,
                [
                    accauntId, 
                    firstName || null, 
                    lastName || null, 
                    patronymic || null,
                    companyName || null,
                    account.email,
                    account.phone,
                    clientTypeId || 1
                ]
            );
            
            return {
                success: true,
                message: 'Клиент успешно создан',
                client: result.rows[0]
            };
            
        } catch (error) {
            console.error('Ошибка в ClientService.createClientFromAccount:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Получить клиента по ID аккаунта
    async getClientByAccountId(accauntId) {
        try {
            const result = await pool.query(
                `SELECT c.*, ct.name as client_type_name
                 FROM clients c
                 LEFT JOIN client_type ct ON c.client_type_id = ct.id
                 WHERE c.accaunt_id = $1`,
                [accauntId]
            );
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Клиент не найден'
                };
            }
            
            return {
                success: true,
                client: result.rows[0]
            };
            
        } catch (error) {
            console.error('Ошибка в ClientService.getClientByAccountId:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Обновить данные клиента
    async updateClient(clientId, updateData) {
        try {
            const { firstName, lastName, patronymic, companyName, clientTypeId } = updateData;
            
            const result = await pool.query(
                `UPDATE clients SET 
                    first_name = COALESCE($1, first_name),
                    last_name = COALESCE($2, last_name),
                    patronymic = COALESCE($3, patronymic),
                    company_name = COALESCE($4, company_name),
                    client_type_id = COALESCE($5, client_type_id),
                    updated_at = NOW()
                 WHERE client_id = $6
                 RETURNING *`,
                [firstName, lastName, patronymic, companyName, clientTypeId, clientId]
            );
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Клиент не найден'
                };
            }
            
            return {
                success: true,
                client: result.rows[0]
            };
            
        } catch (error) {
            console.error('Ошибка в ClientService.updateClient:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Получить всех клиентов (для админа)
    async getAllClients() {
        try {
            const result = await pool.query(
                `SELECT c.*, 
                        ct.name as client_type_name,
                        a.email as account_email,
                        a.last_login
                 FROM clients c
                 LEFT JOIN client_type ct ON c.client_type_id = ct.id
                 LEFT JOIN accaunt a ON c.accaunt_id = a.id_accoun
                 ORDER BY c.created_at DESC`
            );
            
            return {
                success: true,
                clients: result.rows
            };
            
        } catch (error) {
            console.error('Ошибка в ClientService.getAllClients:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Получить профиль пользователя с данными клиента
    async getProfileData(userId) {
        try {
            const result = await pool.query(
                `SELECT a.id_accoun, a.email, a.phone, a.is_email_verified,
                        r.name as role,
                        c.client_id, c.first_name, c.last_name, c.patronymic, c.company_name,
                        ct.name as client_type
                 FROM accaunt a
                 JOIN role r ON a.role_id = r.id
                 LEFT JOIN clients c ON a.id_accoun = c.accaunt_id
                 LEFT JOIN client_type ct ON c.client_type_id = ct.id
                 WHERE a.id_accoun = $1 AND a.is_active = true`,
                [userId]
            );
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Пользователь не найден'
                };
            }
            
            const userData = result.rows[0];
            
            // Статистика проектов
            let projectStats = null;
            if (userData.client_id) {
                const stats = await pool.query(
                    `SELECT COUNT(*) as total_projects
                     FROM projects WHERE client_id = $1`,
                    [userData.client_id]
                );
                projectStats = stats.rows[0];
            }
            
            return {
                success: true,
                profile: {
                    account: {
                        id: userData.id_accoun,
                        email: userData.email,
                        phone: userData.phone,
                        isEmailVerified: userData.is_email_verified,
                        role: userData.role
                    },
                    client: userData.client_id ? {
                        id: userData.client_id,
                        firstName: userData.first_name,
                        lastName: userData.last_name,
                        patronymic: userData.patronymic,
                        companyName: userData.company_name,
                        clientType: userData.client_type,
                        projectStats: projectStats
                    } : null
                }
            };
            
        } catch (error) {
            console.error('Ошибка в ClientService.getProfileData:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new ClientService();
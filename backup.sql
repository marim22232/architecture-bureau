-- =====================================================
-- ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ
-- =====================================================

-- 1. ТАБЛИЦА: project_tags
CREATE TABLE IF NOT EXISTS project_tags (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 2. ТАБЛИЦА: service_categories
CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- 3. ТАБЛИЦА: project_types
CREATE TABLE IF NOT EXISTS project_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES service_categories(id)
);

-- 4. ТАБЛИЦА: users
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'editor')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ТАБЛИЦА: projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    location VARCHAR(255),
    area NUMERIC(10,2),
    project_year INTEGER,
    status VARCHAR(20) CHECK (status IN ('built', 'in_progress', 'concept')),
    project_type_id INTEGER REFERENCES project_types(id),
    client VARCHAR(255),
    main_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- 6. ТАБЛИЦА: awards
CREATE TABLE IF NOT EXISTS awards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    year INTEGER,
    project_id UUID REFERENCES projects(id),
    description TEXT
);

-- 7. ТАБЛИЦА: team
CREATE TABLE IF NOT EXISTS team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    bio TEXT,
    photo VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    specialization VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    experience_years INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    awards TEXT,
    education TEXT,
    birth_date DATE,
    telegram VARCHAR(100),
    linkedin VARCHAR(255),
    rating NUMERIC(3,2) DEFAULT 5.0,
    software_skills TEXT,
    employment_type VARCHAR(50) DEFAULT 'full',
    start_date DATE,
    team_lead BOOLEAN DEFAULT FALSE
);

-- 8. ТАБЛИЦА: employee_private
CREATE TABLE IF NOT EXISTS employee_private (
    id SERIAL PRIMARY KEY,
    team_id UUID NOT NULL UNIQUE REFERENCES team(id) ON DELETE CASCADE,
    passport_series VARCHAR(4),
    passport_number VARCHAR(6),
    passport_issued_by TEXT,
    passport_issue_date DATE,
    passport_department_code VARCHAR(7),
    inn VARCHAR(12),
    snils VARCHAR(14),
    registration_address TEXT,
    actual_address TEXT,
    birth_place VARCHAR(255),
    marriage_status VARCHAR(50),
    children_count INTEGER DEFAULT 0,
    medical_policy_number VARCHAR(16),
    blood_type VARCHAR(5),
    allergies TEXT,
    bank_name VARCHAR(255),
    bank_account VARCHAR(20),
    bank_bik VARCHAR(9),
    bank_inn VARCHAR(12),
    employment_contract_number VARCHAR(50),
    employment_contract_date DATE,
    salary_amount NUMERIC(10,2),
    salary_bonus_percent NUMERIC(5,2) DEFAULT 0,
    vacation_days_remaining INTEGER DEFAULT 28,
    sick_days_this_year INTEGER DEFAULT 0,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ТАБЛИЦА: services
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    price_range VARCHAR(100),
    price_per_sqm NUMERIC(10,2),
    price_fixed NUMERIC(10,2),
    category_id INTEGER REFERENCES service_categories(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- 10. ТАБЛИЦА: contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    area NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT,
    project_type_id INTEGER REFERENCES project_types(id),
    selected_services UUID[]
);

-- 11. ТАБЛИЦА: contact_services
CREATE TABLE IF NOT EXISTS contact_services (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    PRIMARY KEY (contact_id, service_id)
);

-- 12. ТАБЛИЦА: partners
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 13. ТАБЛИЦА: posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    excerpt VARCHAR(500),
    content TEXT,
    cover_image VARCHAR(500),
    author_id UUID REFERENCES team(id),
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. ТАБЛИЦА: project_images
CREATE TABLE IF NOT EXISTS project_images (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_main BOOLEAN DEFAULT FALSE,
    description TEXT
);

-- 15. ТАБЛИЦА: project_rooms
CREATE TABLE IF NOT EXISTS project_rooms (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    area NUMERIC(10,2),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. ТАБЛИЦА: project_services
CREATE TABLE IF NOT EXISTS project_services (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    service_id UUID NOT NULL,
    custom_price NUMERIC(10,2),
    notes TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 17. ТАБЛИЦА: project_tag_relations
CREATE TABLE IF NOT EXISTS project_tag_relations (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES project_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

-- 18. ТАБЛИЦА: project_team
CREATE TABLE IF NOT EXISTS project_team (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_id UUID REFERENCES team(id) ON DELETE CASCADE,
    role VARCHAR(100),
    PRIMARY KEY (project_id, team_id)
);

-- 19. ТАБЛИЦА: site_settings
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    linkedin VARCHAR(255)
);

-- 20. ТАБЛИЦА: testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    project_id UUID REFERENCES projects(id),
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    date DATE,
    is_published BOOLEAN DEFAULT FALSE
);

-- Table: public.employee_private (оптимизированная версия)

CREATE TABLE IF NOT EXISTS public.teem_private (
    id SERIAL PRIMARY KEY,
    team_id UUID NOT NULL UNIQUE,
    
    -- Паспортные данные (ЗАШИФРОВАННЫЕ)
    passport_data BYTEA,           -- Вся информация о паспорте в JSON/Text (серия, номер, кем выдан, код, дата)
    inn BYTEA,                     -- ИНН (зашифрованный)
    snils BYTEA,                   -- СНИЛС (зашифрованный)
    
    -- Адреса (зашифрованные)
    registration_address BYTEA,    -- Адрес регистрации
    actual_address BYTEA,          -- Фактический адрес (если пусто = как регистрация)
    
    -- Личная информация
    birth_place BYTEA,             -- Место рождения
    marriage_status VARCHAR(20),   -- married/single/divorced/widowed (не критично шифровать)
    children_count INT DEFAULT 0,
    
    -- Медицинская информация
    medical_info BYTEA,            -- Полис, группа крови, аллергии (всё в одном JSON)
    
    -- Банковские реквизиты (зашифрованные)
    bank_details BYTEA,            -- Название банка, счёт, БИК, ИНН банка
    
    -- Трудовой договор
    contract_info BYTEA,           -- Номер договора, дата, зарплата, бонус
    
    -- Отпуска и больничные
    vacation_days_remaining INT DEFAULT 28,
    sick_days_this_year INT DEFAULT 0,
    
    -- Контакт в экстренной ситуации
    emergency_contact BYTEA,       -- Имя, телефон, отношение
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT employee_private_team_id_fkey FOREIGN KEY (team_id)
        REFERENCES public.team (id) ON DELETE CASCADE
);

-- Индексы для поиска (по хешам, а не по самим данным)
CREATE INDEX IF NOT EXISTS idx_employee_private_inn_hash ON public.employee_private (sha256(inn::bytea));
CREATE INDEX IF NOT EXISTS idx_employee_private_snils_hash ON public.employee_private (sha256(snils::bytea));
-- =====================================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- =====================================================

-- Индексы для employee_private
CREATE INDEX IF NOT EXISTS idx_employee_private_inn ON employee_private(inn);
CREATE INDEX IF NOT EXISTS idx_employee_private_snils ON employee_private(snils);

-- Индексы для contact_services
CREATE INDEX IF NOT EXISTS ix_contact_services_contact ON contact_services(contact_id);

-- Индексы для contacts
CREATE INDEX IF NOT EXISTS fki_project_type_id ON contacts(project_type_id);

-- Индексы для project_images
CREATE INDEX IF NOT EXISTS ix_project_images_project_id ON project_images(project_id);

-- Индексы для project_rooms
CREATE INDEX IF NOT EXISTS ix_project_rooms_project_id ON project_rooms(project_id);

-- Индексы для project_services
CREATE INDEX IF NOT EXISTS ix_project_services_project_id ON project_services(project_id);

-- Индексы для projects
CREATE INDEX IF NOT EXISTS ix_projects_area ON projects(area);
CREATE INDEX IF NOT EXISTS ix_projects_project_type_id ON projects(project_type_id);
CREATE INDEX IF NOT EXISTS ix_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS ix_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS ix_projects_year ON projects(project_year);

-- Индексы для services
CREATE INDEX IF NOT EXISTS ix_services_category_id ON services(category_id) WHERE is_active = true;

-- Индексы для testimonials
CREATE INDEX IF NOT EXISTS ix_testimonials_rating ON testimonials(rating);

-- Индекс для project_types
CREATE INDEX IF NOT EXISTS fki_c ON project_types(category_id);

-- =====================================================
-- НАЗНАЧЕНИЕ ВЛАДЕЛЬЦА
-- =====================================================

ALTER TABLE project_tags OWNER TO postgres;
ALTER TABLE service_categories OWNER TO postgres;
ALTER TABLE project_types OWNER TO postgres;
ALTER TABLE users OWNER TO postgres;
ALTER TABLE projects OWNER TO postgres;
ALTER TABLE awards OWNER TO postgres;
ALTER TABLE team OWNER TO postgres;
ALTER TABLE employee_private OWNER TO postgres;
ALTER TABLE services OWNER TO postgres;
ALTER TABLE contacts OWNER TO postgres;
ALTER TABLE contact_services OWNER TO postgres;
ALTER TABLE partners OWNER TO postgres;
ALTER TABLE posts OWNER TO postgres;
ALTER TABLE project_images OWNER TO postgres;
ALTER TABLE project_rooms OWNER TO postgres;
ALTER TABLE project_services OWNER TO postgres;
ALTER TABLE project_tag_relations OWNER TO postgres;
ALTER TABLE project_team OWNER TO postgres;
ALTER TABLE site_settings OWNER TO postgres;
ALTER TABLE testimonials OWNER TO postgres;

-- Создаём таблицу с общими данными клиентов
CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    client_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    client_type VARCHAR(20) DEFAULT 'individual', -- individual / legal
    company_name VARCHAR(255), -- для юрлиц
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для поиска
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_last_name ON clients(last_name);

-- Создаём таблицу ролей (справочник)
CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,        -- user, admin, manager, architect, employee
    description TEXT,                         -- описание роли
    priority INTEGER DEFAULT 0,               -- приоритет (чем выше, тем больше прав)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем базовые роли
INSERT INTO role (name, description, priority) VALUES
    ('user', 'Обычный пользователь (клиент)', 10),
    ('employee', 'Сотрудник компании', 30),
    ('architect', 'Архитектор', 40),
    ('manager', 'Менеджер', 70),
    ('admin', 'Администратор', 100);

    -- Полная версия таблицы accaunt (с ролью по ID)
CREATE TABLE IF NOT EXISTS accaunt (
    id_accoun UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 1,       -- ссылка на таблицу role (по умолчанию 'user')
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Внешний ключ на таблицу role
    CONSTRAINT fk_accaunt_role FOREIGN KEY (role_id) 
        REFERENCES role(id) ON DELETE RESTRICT,
    
    -- Контроль: либо email, либо телефон должны быть заполнены
    CONSTRAINT email_or_phone_check CHECK (
        (email IS NOT NULL AND phone IS NULL) OR
        (email IS NULL AND phone IS NOT NULL)
    )
);

-- Индексы для быстрого поиска
CREATE INDEX idx_accaunt_email ON accaunt(email);
CREATE INDEX idx_accaunt_phone ON accaunt(phone);
CREATE INDEX idx_accaunt_role_id ON accaunt(role_id);

-- =====================================================
-- 1. ТАБЛИЦА РОЛЕЙ
-- =====================================================
CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO role (name, description, priority) VALUES
    ('user', 'Клиент (зарегистрированный пользователь)', 10),
    ('employee', 'Сотрудник компании', 30),
    ('architect', 'Архитектор', 40),
    ('manager', 'Менеджер', 70),
    ('admin', 'Администратор', 100);

-- =====================================================
-- 2. ГЛАВНАЯ ТАБЛИЦА АККАУНТОВ
-- =====================================================
CREATE TABLE IF NOT EXISTS accaunt (
    id_accoun UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 1,
    
    -- Верификация
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    verification_code VARCHAR(6),              -- Код подтверждения
    verification_code_expires TIMESTAMP,       -- Время жизни кода
    
    -- Статус аккаунта
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    last_login_ip INET,
    
    -- Внешние ключи
    CONSTRAINT fk_accaunt_role FOREIGN KEY (role_id) 
        REFERENCES role(id) ON DELETE RESTRICT,
    
    -- Контроль: либо email, либо телефон
    CONSTRAINT email_or_phone_check CHECK (
        (email IS NOT NULL AND phone IS NULL) OR
        (email IS NULL AND phone IS NOT NULL)
    )
);

-- Индексы
CREATE INDEX idx_accaunt_email ON accaunt(email);
CREATE INDEX idx_accaunt_phone ON accaunt(phone);
CREATE INDEX idx_accaunt_role ON accaunt(role_id);
CREATE INDEX idx_accaunt_verification ON accaunt(verification_code, verification_code_expires);

-- =====================================================
-- 3. СВЯЗЬ С КЛИЕНТАМИ (договоры, проекты)
-- =====================================================
-- Добавляем accaunt_id в существующую таблицу clients
ALTER TABLE public.clients 
ADD COLUMN accaunt_id UUID UNIQUE,
ADD CONSTRAINT fk_clients_accaunt 
FOREIGN KEY (accaunt_id) 
REFERENCES public.accaunt(id_accoun) ON DELETE SET NULL;

-- =====================================================
-- 4. ТАБЛИЦА СЕССИЙ (для отслеживания входов)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accaunt_id UUID NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_session_accaunt FOREIGN KEY (accaunt_id)
        REFERENCES accaunt(id_accoun) ON DELETE CASCADE
);

CREATE INDEX idx_session_token ON user_session(session_token);
CREATE INDEX idx_session_accaunt ON user_session(accaunt_id);

-- =====================================================
-- 5. ТАБЛИЦА ВОССТАНОВЛЕНИЯ ПАРОЛЯ
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accaunt_id UUID NOT NULL,
    reset_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reset_accaunt FOREIGN KEY (accaunt_id)
        REFERENCES accaunt(id_accoun) ON DELETE CASCADE
);

CREATE INDEX idx_reset_token ON password_reset(reset_token);

-- =====================================================
-- 6. ТАБЛИЦА ИСТОРИИ ВХОДОВ (аудит безопасности)
-- =====================================================
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    accaunt_id UUID NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    login_type VARCHAR(20),  -- email, phone, google, telegram
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    
    CONSTRAINT fk_login_accaunt FOREIGN KEY (accaunt_id)
        REFERENCES accaunt(id_accoun) ON DELETE CASCADE
);

CREATE INDEX idx_login_accaunt ON login_history(accaunt_id);
CREATE INDEX idx_login_time ON login_history(login_time);

-- Функция регистрации
CREATE OR REPLACE FUNCTION register_user(
    p_email VARCHAR,
    p_phone VARCHAR,
    p_password VARCHAR,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_client_type_id INTEGER DEFAULT 1
)
RETURNS TABLE(
    accaunt_id UUID,
    verification_code VARCHAR,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_accaunt_id UUID;
    v_verification_code VARCHAR(6);
BEGIN
    -- Генерируем код подтверждения
    v_verification_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Создаём аккаунт
    INSERT INTO accaunt (
        email, phone, password_hash, role_id,
        verification_code, verification_code_expires,
        is_email_verified, is_phone_verified
    ) VALUES (
        p_email, p_phone, crypt(p_password, gen_salt('bf')), 
        (SELECT id FROM role WHERE name = 'user'),
        v_verification_code, NOW() + INTERVAL '15 minutes',
        FALSE, FALSE
    )
    RETURNING id_accoun INTO v_accaunt_id;
    
    -- Создаём запись в clients
    INSERT INTO clients (
        accaunt_id, first_name, last_name, 
        email, phone, client_type_id
    ) VALUES (
        v_accaunt_id, p_first_name, p_last_name,
        p_email, p_phone, p_client_type_id
    );
    
    RETURN QUERY SELECT 
        v_accaunt_id, 
        v_verification_code, 
        TRUE, 
        'Регистрация успешна. Подтвердите email/телефон'::TEXT;
        
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        NULL::UUID, 
        NULL::VARCHAR, 
        FALSE, 
        SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;


-- Функция подтверждения
CREATE OR REPLACE FUNCTION verify_user(
    p_login VARCHAR,
    p_code VARCHAR
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_accaunt RECORD;
BEGIN
    -- Находим аккаунт по email или телефону
    SELECT * INTO v_accaunt
    FROM accaunt
    WHERE (email = p_login OR phone = p_login)
        AND verification_code = p_code
        AND verification_code_expires > NOW();
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Неверный или просроченный код подтверждения'::TEXT;
        RETURN;
    END IF;
    
    -- Подтверждаем контакт
    IF v_accaunt.email IS NOT NULL THEN
        UPDATE accaunt SET 
            is_email_verified = TRUE,
            email_verified_at = NOW(),
            verification_code = NULL
        WHERE id_accoun = v_accaunt.id_accoun;
    ELSE
        UPDATE accaunt SET 
            is_phone_verified = TRUE,
            phone_verified_at = NOW(),
            verification_code = NULL
        WHERE id_accoun = v_accaunt.id_accoun;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Аккаунт успешно подтверждён'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Функция входа
CREATE OR REPLACE FUNCTION login_user(
    p_login VARCHAR,
    p_password VARCHAR,
    p_ip INET,
    p_user_agent TEXT
)
RETURNS TABLE(
    accaunt_id UUID,
    session_token VARCHAR,
    role_name VARCHAR,
    full_name TEXT,
    email VARCHAR,
    phone VARCHAR,
    is_verified BOOLEAN,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_accaunt RECORD;
    v_session_token VARCHAR;
BEGIN
    -- Ищем пользователя
    SELECT a.*, r.name as role_name INTO v_accaunt
    FROM accaunt a
    JOIN role r ON a.role_id = r.id
    WHERE (a.email = p_login OR a.phone = p_login);
    
    IF NOT FOUND THEN
        -- Записываем неудачную попытку
        INSERT INTO login_history (accaunt_id, ip_address, user_agent, success, failure_reason)
        VALUES (NULL, p_ip, p_user_agent, FALSE, 'Пользователь не найден');
        
        RETURN QUERY SELECT 
            NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::TEXT, 
            NULL::VARCHAR, NULL::VARCHAR, FALSE, FALSE, 'Неверный логин или пароль'::TEXT;
        RETURN;
    END IF;
    
    -- Проверяем пароль
    IF v_accaunt.password_hash = crypt(p_password, v_accaunt.password_hash) THEN
        -- Проверяем, не заблокирован ли аккаунт
        IF v_accaunt.is_blocked THEN
            RETURN QUERY SELECT 
                NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::TEXT,
                NULL::VARCHAR, NULL::VARCHAR, FALSE, FALSE, 
                'Аккаунт заблокирован. Причина: ' || COALESCE(v_accaunt.blocked_reason, 'Не указана')::TEXT;
            RETURN;
        END IF;
        
        -- Генерируем токен сессии
        v_session_token := encode(gen_random_bytes(32), 'hex');
        
        -- Создаём сессию
        INSERT INTO user_session (accaunt_id, session_token, ip_address, user_agent, expires_at)
        VALUES (v_accaunt.id_accoun, v_session_token, p_ip, p_user_agent, NOW() + INTERVAL '30 days');
        
        -- Обновляем last_login
        UPDATE accaunt SET 
            last_login = NOW(),
            last_login_ip = p_ip
        WHERE id_accoun = v_accaunt.id_accoun;
        
        -- Записываем успешный вход
        INSERT INTO login_history (accaunt_id, ip_address, user_agent, success)
        VALUES (v_accaunt.id_accoun, p_ip, p_user_agent, TRUE);
        
        -- Получаем ФИО из clients или team
        RETURN QUERY
        SELECT 
            v_accaunt.id_accoun,
            v_session_token,
            v_accaunt.role_name,
            COALESCE(
                (SELECT first_name || ' ' || last_name FROM clients WHERE accaunt_id = v_accaunt.id_accoun),
                (SELECT name FROM team WHERE accaunt_id = v_accaunt.id_accoun),
                'Пользователь'
            )::TEXT,
            v_accaunt.email,
            v_accaunt.phone,
            (v_accaunt.is_email_verified OR v_accaunt.is_phone_verified),
            TRUE,
            'Вход выполнен успешно'::TEXT;
    ELSE
        -- Неверный пароль
        INSERT INTO login_history (accaunt_id, ip_address, user_agent, success, failure_reason)
        VALUES (v_accaunt.id_accoun, p_ip, p_user_agent, FALSE, 'Неверный пароль');
        
        RETURN QUERY SELECT 
            NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::TEXT,
            NULL::VARCHAR, NULL::VARCHAR, FALSE, FALSE, 'Неверный логин или пароль'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция получения данных для личного кабинета
CREATE OR REPLACE FUNCTION get_profile_data(p_accaunt_id UUID)
RETURNS TABLE(
    -- Данные аккаунта
    email VARCHAR,
    phone VARCHAR,
    role_name VARCHAR,
    is_email_verified BOOLEAN,
    is_phone_verified BOOLEAN,
    
    -- Данные клиента (если есть)
    client_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    patronymic VARCHAR,
    company_name VARCHAR,
    client_type_name VARCHAR,
    
    -- Статистика
    total_projects INTEGER,
    active_projects INTEGER,
    total_contracts NUMERIC,
    
    -- Последняя активность
    last_login TIMESTAMP,
    last_login_ip INET
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.email,
        a.phone,
        r.name,
        a.is_email_verified,
        a.is_phone_verified,
        c.client_id,
        c.first_name,
        c.last_name,
        c.patronymic,
        c.company_name,
        ct.name,
        -- Подсчёт проектов (нужно создать таблицу projects)
        (SELECT COUNT(*) FROM projects WHERE client_id = c.client_id)::INTEGER,
        (SELECT COUNT(*) FROM projects WHERE client_id = c.client_id AND status = 'active')::INTEGER,
        (SELECT COALESCE(SUM(contract_amount), 0) FROM contracts WHERE client_id = c.client_id)::NUMERIC,
        a.last_login,
        a.last_login_ip
    FROM accaunt a
    JOIN role r ON a.role_id = r.id
    LEFT JOIN clients c ON a.id_accoun = c.accaunt_id
    LEFT JOIN client_type ct ON c.client_type_id = ct.id
    WHERE a.id_accoun = p_accaunt_id;
END;
$$ LANGUAGE plpgsql;

-- Функция выхода
CREATE OR REPLACE FUNCTION logout_user(p_session_token VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_session 
    SET is_active = FALSE
    WHERE session_token = p_session_token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Смотрим расшифрованные данные через представление
SELECT * FROM team_secure_view;


-- Теперь должно работать
SELECT * FROM clients_secure_view;
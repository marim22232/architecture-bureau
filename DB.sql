-- ======================================
-- Таблица типов проектов
-- ======================================
CREATE TABLE project_types (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ======================================
-- Таблица проектов
-- ======================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    location VARCHAR(255),
    area DECIMAL(10,2),
    project_year INT,
    status VARCHAR(20) CHECK (status IN ('built', 'in_progress', 'concept')),
    project_type_id INT REFERENCES project_types(id),
    client VARCHAR(255),
    main_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Команда
-- ======================================
CREATE TABLE team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    bio TEXT,
    photo VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    specialization VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- ======================================
-- Услуги
-- ======================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    price_range VARCHAR(100),
    price_per_sqm DECIMAL(10,2),     -- цена за м²
    price_fixed DECIMAL(10,2),       -- фиксированная цена
    category VARCHAR(50) DEFAULT 'architecture',
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ======================================
-- Изображения проектов
-- ======================================
CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_main BOOLEAN DEFAULT FALSE
);

-- ======================================
-- Проекты ↔ Команда
-- ======================================
CREATE TABLE project_team (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_id UUID REFERENCES team(id) ON DELETE CASCADE,
    role VARCHAR(100),
    PRIMARY KEY (project_id, team_id)
);

-- ======================================
-- Отзывы
-- ======================================
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    project_id UUID REFERENCES projects(id),
    text TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    date DATE,
    is_published BOOLEAN DEFAULT FALSE
);

-- ======================================
-- Контакты
-- ======================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    service_id UUID REFERENCES services(id),
    status VARCHAR(50) DEFAULT 'new'
        CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Партнеры
-- ======================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ======================================
-- Награды
-- ======================================
CREATE TABLE awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    year INT,
    project_id UUID REFERENCES projects(id),
    description TEXT
);

-- ======================================
-- Теги
-- ======================================
CREATE TABLE project_tags (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE project_tag_relations (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tag_id INT REFERENCES project_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

-- ======================================
-- Блог
-- ======================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    excerpt VARCHAR(500),
    content TEXT,
    cover_image VARCHAR(500),
    author_id UUID REFERENCES team(id),
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Пользователи
-- ======================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'editor')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Настройки сайта
-- ======================================
CREATE TABLE site_settings (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    linkedin VARCHAR(255)
);

-- ======================================
-- Индексы
-- ======================================
CREATE INDEX IX_projects_slug ON projects(slug);
CREATE INDEX IX_projects_status ON projects(status);
CREATE INDEX IX_projects_project_type_id ON projects(project_type_id);
CREATE INDEX IX_projects_area ON projects(area);
CREATE INDEX IX_projects_year ON projects(project_year);
CREATE INDEX IX_project_images_project_id ON project_images(project_id);
CREATE INDEX IX_testimonials_rating ON testimonials(rating);
CREATE INDEX IX_contacts_status ON contacts(status);
CREATE INDEX IX_contacts_created ON contacts(created_at);

CREATE TABLE project_rooms (
    id BIGSERIAL PRIMARY KEY,  -- ← 1, 2, 3... (до 9 223 372 036 854 775 807)
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    area DECIMAL(10,2),
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска
CREATE INDEX IX_project_rooms_project_id ON project_rooms(project_id);



-- Таблица услуг, оказанных в конкретном проекте
CREATE TABLE project_services (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id),
    custom_price DECIMAL(10,2),  -- если цена была индивидуальной
    notes TEXT,
    sort_order INT DEFAULT 0
);

CREATE INDEX IX_project_services_project_id ON project_services(project_id);


ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE projects ADD COLUMN updated_by UUID REFERENCES users(id);

CREATE TABLE services (
    id TEXT PRIMARY KEY DEFAULT generate_ulid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    price_range VARCHAR(100),
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создать расширение для ULID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Функция генерации ULID
CREATE OR REPLACE FUNCTION generate_ulid() RETURNS TEXT AS $$
DECLARE
    timestamp BIGINT;
    random_part TEXT;
BEGIN
    timestamp = FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000);
    random_part = encode(gen_random_bytes(10), 'hex');
    RETURN lpad(to_hex(timestamp), 12, '0') || random_part;
END;
$$ LANGUAGE plpgsql;


-- Создаем новую таблицу с детальными полями
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    
    -- Детали заявки
    city VARCHAR(255),
    question TEXT,
    project_type VARCHAR(100),      -- тип объекта (дом, интерьер, офис)
    area DECIMAL(10,2),             -- площадь объекта
    services TEXT[],                -- массив выбранных услуг
    
    -- Системные поля
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE contacts ADD COLUMN message TEXT;
ALTER TABLE contacts ADD COLUMN service_id UUID;

-- Таблица категорий услуг
CREATE TABLE service_categories (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Добавляем категории
INSERT INTO service_categories (name, slug, description, sort_order) VALUES 
('Архитектурные услуги', 'architecture', 'Проектирование и строительство зданий', 1),
('Дизайн интерьера', 'interior', 'Дизайн и отделка помещений', 2);

-- Добавляем поле category_id вместо category
ALTER TABLE services ADD COLUMN category_id INT REFERENCES service_categories(id);

-- Обновляем существующие записи
UPDATE services SET category_id = (SELECT id FROM service_categories WHERE slug = 'architecture') 
WHERE title IN (
    'Архитектурно-планировочная концепция',
    'Визуализация',
    'Макет',
    'Строительный проект',
    'Инженерные сети',
    'Авторское сопровождение (год)',
    'Служба клиента (год)'
);

UPDATE services SET category_id = (SELECT id FROM service_categories WHERE slug = 'interior') 
WHERE title IN (
    'Дизайн-проект',
    'Ведомость материалов',
    'Составление сметы',
    'Комплектация',
    'Авторское сопровождение (мес)',
    'Служба клиента (мес)'
);

-- Удаляем старое поле category (если нужно)
ALTER TABLE services DROP COLUMN category;
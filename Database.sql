-- ======================================
-- Таблица проектов / портфолио
-- Хранит все проекты архитектурного бюро
-- ======================================
CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(), -- Уникальный GUID проекта
    title NVARCHAR(255) NOT NULL,  -- Название проекта
    slug NVARCHAR(255) UNIQUE,     -- ЧПУ / URL проекта (например "zhk-akvamarin")
    description NVARCHAR(MAX),     -- Полное описание проекта
    location NVARCHAR(255),        -- Адрес / город / страна
    area DECIMAL(10,2),            -- Площадь в квадратных метрах
    project_year INT,              -- Год реализации
    status NVARCHAR(20)            -- Статус проекта: 'built' - реализован, 'in_progress' - в процессе, 'concept' - концепция
        CHECK (status IN ('built', 'in_progress', 'concept')),
    project_type_id INT,           -- Ссылка на тип проекта
    client NVARCHAR(255),          -- Имя заказчика
    awards NVARCHAR(MAX),          -- Награды проекта (лучше использовать отдельную таблицу awards)
    main_image NVARCHAR(500),      -- URL главного изображения
    created_at DATETIME2 DEFAULT SYSDATETIME(), -- Дата создания записи
    updated_at DATETIME2 DEFAULT SYSDATETIME()  -- Дата последнего обновления
);

-- ======================================
-- Таблица команды
-- Хранит всех сотрудников / архитекторов
-- ======================================
CREATE TABLE team (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(), -- GUID сотрудника
    name NVARCHAR(255) NOT NULL,       -- Имя сотрудника
    position NVARCHAR(255),            -- Должность
    bio NVARCHAR(MAX),                 -- Биография / описание опыта
    photo NVARCHAR(500),               -- Фото сотрудника
    email NVARCHAR(255),               -- Email
    phone NVARCHAR(50),                -- Телефон
    specialization NVARCHAR(255),      -- Специализация (например, "интерьеры", "жилые дома")
    sort_order INT DEFAULT 0,          -- Порядок сортировки на сайте
    is_active BIT DEFAULT 1            -- Активность сотрудника (0 = скрыт, 1 = активен)
);
-- ======================================
-- Таблица услуг
-- Хранит все предоставляемые услуги бюро
-- ======================================
CREATE TABLE services (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(), -- GUID услуги
    title NVARCHAR(255) NOT NULL,      -- Название услуги
    description NVARCHAR(MAX),         -- Описание услуги
    icon NVARCHAR(100),                -- Иконка / символ услуги
    price_range NVARCHAR(100),         -- Диапазон цен (например, "от 50 000 до 200 000 ₽")
    is_popular BIT DEFAULT 0,          -- Популярная услуга (для выделения на сайте)
    is_active BIT DEFAULT 1            -- Активна ли услуга
);

-- ======================================
-- Таблица изображений проектов
-- Хранит все фотографии проектов
-- ======================================
CREATE TABLE project_images (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(), -- GUID изображения
    project_id UNIQUEIDENTIFIER NOT NULL,                     -- Ссылка на проект
    image_url NVARCHAR(500) NOT NULL,                         -- URL изображения
    thumbnail_url NVARCHAR(500),                               -- URL миниатюры
    caption NVARCHAR(255),                                     -- Подпись к фото
    sort_order INT DEFAULT 0,                                   -- Порядок отображения
    is_main BIT DEFAULT 0,                                      -- Главное изображение проекта
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
-- ======================================
-- Связующая таблица проекты ↔ команда
-- Хранит кто из сотрудников участвовал в проекте
-- ======================================
CREATE TABLE project_team (
    project_id UNIQUEIDENTIFIER NOT NULL, -- Ссылка на проект
    team_id UNIQUEIDENTIFIER NOT NULL,    -- Ссылка на сотрудника
    role NVARCHAR(100),                   -- Роль в проекте (главный архитектор, дизайнер и т.д.)
    PRIMARY KEY (project_id, team_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
);
-- ======================================
-- Таблица отзывов клиентов
-- Хранит отзывы по проектам
-- ======================================
CREATE TABLE testimonials (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    client_name NVARCHAR(255) NOT NULL,   -- Имя клиента
    client_company NVARCHAR(255),         -- Компания клиента
    project_id UNIQUEIDENTIFIER,          -- Ссылка на проект (если отзыв привязан к проекту)
    text NVARCHAR(MAX) NOT NULL,          -- Текст отзыва
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Оценка от 1 до 5
    date DATE,                             -- Дата отзыва
    is_published BIT DEFAULT 0,           -- Опубликован ли отзыв
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
-- ======================================
-- Таблица контактов / заявок
-- Хранит все сообщения с сайта
-- ======================================
CREATE TABLE contacts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    name NVARCHAR(255) NOT NULL,         -- Имя отправителя
    email NVARCHAR(255),                  -- Email
    phone NVARCHAR(50),                   -- Телефон
    message NVARCHAR(MAX),                -- Сообщение
    service_id UNIQUEIDENTIFIER,          -- Ссылка на услугу, по которой обращение
    status NVARCHAR(50) DEFAULT 'new'     -- Статус заявки: new / in_progress / completed
        CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    FOREIGN KEY (service_id) REFERENCES services(id)
);
-- ======================================
-- Таблица партнеров
-- Хранит компании-партнёров бюро
-- ======================================
CREATE TABLE partners (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    name NVARCHAR(255) NOT NULL,        -- Название компании
    logo NVARCHAR(500),                  -- Логотип
    website NVARCHAR(255),               -- Сайт партнёра
    description NVARCHAR(MAX),           -- Описание компании
    is_active BIT DEFAULT 1              -- Активен ли партнер
);
-- ======================================
-- Таблица наград
-- Хранит награды проектов
-- ======================================
CREATE TABLE awards (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    name NVARCHAR(255) NOT NULL,         -- Название награды
    organization NVARCHAR(255),          -- Организация, вручавшая награду
    year INT,                             -- Год получения
    project_id UNIQUEIDENTIFIER,          -- Ссылка на проект
    description NVARCHAR(MAX),            -- Описание награды
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
-- ======================================
-- Таблица типов проектов
-- Жилые, коммерческие, интерьеры и т.д.
-- ======================================
CREATE TABLE project_types (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,          -- Название типа
    description NVARCHAR(MAX),            -- Описание типа
    is_active BIT DEFAULT 1
);
-- ======================================
-- Таблица тегов для проектов
-- Для фильтров по стилю, материалам и концепции
-- ======================================
CREATE TABLE project_tags (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL
);
-- ======================================
-- Связующая таблица проекты ↔ теги
-- Многие-ко-многим
-- ======================================
CREATE TABLE project_tag_relations (
    project_id UNIQUEIDENTIFIER NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES project_tags(id) ON DELETE CASCADE
);
-- ======================================
-- Таблица блога / новостей
-- ======================================
CREATE TABLE posts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    title NVARCHAR(255) NOT NULL,       -- Заголовок
    slug NVARCHAR(255) UNIQUE,          -- URL записи
    excerpt NVARCHAR(500),               -- Краткий анонс
    content NVARCHAR(MAX),               -- Полный текст
    cover_image NVARCHAR(500),           -- Картинка для поста
    published_at DATETIME2,              -- Дата публикации
    is_published BIT DEFAULT 0,          -- Опубликовано?
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
-- ======================================
-- Таблица пользователей (админка)
-- ======================================
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    email NVARCHAR(255) UNIQUE NOT NULL,    -- Логин / email
    password_hash NVARCHAR(255) NOT NULL,   -- Хэш пароля
    role NVARCHAR(50) CHECK (role IN ('admin', 'editor')), -- Роль
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
-- Настройки сайта (контакты, соцсети)
CREATE TABLE site_settings (
    id INT PRIMARY KEY IDENTITY(1,1),
    phone NVARCHAR(50),
    email NVARCHAR(255),
    address NVARCHAR(255),
    instagram NVARCHAR(255),
    facebook NVARCHAR(255),
    linkedin NVARCHAR(255)
);
-- ======================================
-- Индексы для ускорения выборки
-- ======================================
CREATE INDEX IX_projects_slug ON projects(slug);
CREATE INDEX IX_projects_status ON projects(status);
CREATE INDEX IX_projects_project_type_id ON projects(project_type_id);
CREATE INDEX IX_project_images_project_id ON project_images(project_id);

ALTER TABLE projects
ADD CONSTRAINT FK_projects_project_types
FOREIGN KEY (project_type_id) REFERENCES project_types(id);

ALTER TABLE team
ALTER COLUMN name NVARCHAR(255) NOT NULL;

ALTER TABLE team
ALTER COLUMN position NVARCHAR(255);

ALTER TABLE team
ALTER COLUMN bio NVARCHAR(MAX);

ALTER TABLE team
ALTER COLUMN photo NVARCHAR(500);

ALTER TABLE team
ALTER COLUMN email NVARCHAR(255);

ALTER TABLE team
ALTER COLUMN phone NVARCHAR(50);

ALTER TABLE team
ALTER COLUMN specialization NVARCHAR(255);

-- Добавьте в таблицу posts:
ALTER TABLE posts
ADD author_id UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSDATETIME(),
    views INT DEFAULT 0;

ALTER TABLE posts
ADD CONSTRAINT FK_posts_team 
FOREIGN KEY (author_id) REFERENCES team(id);

-- Добавьте для производительности:
CREATE INDEX IX_projects_area ON projects(area);
CREATE INDEX IX_projects_year ON projects(project_year);
CREATE INDEX IX_testimonials_rating ON testimonials(rating);
CREATE INDEX IX_contacts_status ON contacts(status);
CREATE INDEX IX_contacts_created ON contacts(created_at);

DROP TABLE IF EXISTS project_team;
DROP TABLE IF EXISTS team;

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'team';
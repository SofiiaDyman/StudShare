-- ===== СТВОРЕННЯ БАЗИ ДАНИХ =====
DROP DATABASE IF EXISTS student_housing;

CREATE DATABASE student_housing 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE student_housing;

-- ===== ВИДАЛЕННЯ ТАБЛИЦІ ЯКЩО ІСНУЄ =====
DROP TABLE IF EXISTS favorite_listings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS listings;

-- ===== СТВОРЕННЯ ТАБЛИЦІ ОГОЛОШЕНЬ =====
CREATE TABLE listings (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Унікальний ID оголошення',
    
    student_id VARCHAR(100) NOT NULL COMMENT 'ID студента який створив оголошення',
    
    gender ENUM('хлопець', 'дівчина') NOT NULL COMMENT 'Стать власника',
    
    faculty VARCHAR(100) NOT NULL COMMENT 'Факультет',
    
    course INT NOT NULL CHECK (course BETWEEN 1 AND 6) COMMENT 'Курс навчання',
    
    specialty VARCHAR(100) NOT NULL COMMENT 'Спеціальність',
    
    district VARCHAR(100) NOT NULL COMMENT 'Район міста',
    
    address VARCHAR(255) NOT NULL COMMENT 'Адреса квартири',
    
    rooms_count INT NOT NULL CHECK (rooms_count > 0) COMMENT 'Кількість кімнат',
    
    people_count INT NOT NULL CHECK (people_count > 0) COMMENT 'Кількість мешканців',
    
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0) COMMENT 'Ціна за місяць',
    
    utilities_included BOOLEAN DEFAULT FALSE COMMENT 'Комунальні включені в ціну',
    
    additional_info TEXT COMMENT 'Додаткова інформація',
    
    contact_phone VARCHAR(20) NOT NULL COMMENT 'Номер телефону',
    
    contact_telegram VARCHAR(50) COMMENT 'Нік у Telegram',
    
    contact_instagram VARCHAR(50) COMMENT 'Нік в Instagram',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата створення',
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата оновлення',
    
    INDEX idx_district (district),
    INDEX idx_faculty (faculty),
    INDEX idx_price (price),
    INDEX idx_created (created_at),
    INDEX idx_student_id (student_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Таблиця оголошень про житло';

-- ===== ТАБЛИЦЯ КОРИСТУВАЧІВ =====
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Облікові записи користувачів';

-- ===== ТАБЛИЦЯ ОБРАНИХ ОГОЛОШЕНЬ =====
CREATE TABLE favorite_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, listing_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Збережені студентами оголошення';

-- ===== ДОДАВАННЯ ТЕСТОВИХ ДАНИХ =====

INSERT INTO listings 
(student_id, gender, faculty, course, specialty, district, address, rooms_count, people_count, price, utilities_included, additional_info, contact_phone, contact_telegram, contact_instagram) 
VALUES 

('student_sample_1', 'дівчина', 'Прикладної математики та інформатики', 3, 'Комп\'ютерні науки', 'Франківський', 'вул. Наукова, 15', 2, 1, 2500.00, TRUE, 'Тиха квартира, поблизу університет.', '+380671234567', '@example_user', '@example_user'),

('student_sample_2', 'хлопець', 'Економічний', 2, 'Економіка', 'Сихівський', 'вул. Стрийська, 201', 3, 2, 2000.00, FALSE, 'Велика квартира, є Wi-Fi.', '+380959876543', '@student_lviv', NULL),

('student_sample_3', 'дівчина', 'Філологічний', 4, 'Українська мова', 'Галицький', 'вул. Коперника, 7', 2, 1, 3000.00, TRUE, 'Центр міста, поруч бібліотека.', '+380987654321', '@studentka_lnu', '@student_life'),

('student_sample_4', 'хлопець', 'Журналістики', 1, 'Журналістика', 'Залізничний', 'вул. Городоцька, 45', 2, 1, 2200.00, FALSE, 'Близько до центру.', '+380501234567', '@journalist_lviv', NULL),

('student_sample_5', 'дівчина', 'Іноземних мов', 3, 'Англійська мова', 'Личаківський', 'вул. Мечникова, 12', 3, 2, 2800.00, TRUE, 'Затишна квартира.', '+380931234567', '@english_girl', '@language_love'),

('student_sample_6', 'хлопець', 'Юридичний', 2, 'Право', 'Шевченківський', 'вул. Шевченка, 8', 2, 1, 2600.00, FALSE, 'Біля університету, тихий район.', '+380971112233', '@law_student', NULL),

('student_sample_7', 'дівчина', 'Хімічний', 4, 'Хімія', 'Франківський', 'вул. Київська, 77', 3, 2, 2400.00, TRUE, 'Просторі кімнати, ремонт.', '+380663334455', '@chemistry_girl', '@chem_life'),

('student_sample_8', 'хлопець', 'Фізичний', 3, 'Фізика', 'Сихівський', 'вул. Наукова, 100', 2, 1, 2100.00, FALSE, 'Поруч лабораторії університету.', '+380994445566', '@physicist', NULL),

('student_sample_9', 'дівчина', 'Міжнародних відносин', 2, 'Міжнародні відносини', 'Галицький', 'вул. Франка, 25', 2, 1, 3200.00, TRUE, 'Центр, євроремонт.', '+380685556677', '@international', '@world_citizen'),

('student_sample_10', 'хлопець', 'Біологічний', 1, 'Біологія', 'Личаківський', 'вул. Грушевського, 33', 3, 2, 1900.00, FALSE, 'Недорого, є меблі.', '+380977778899', '@bio_student', NULL);

-- ===== ПЕРЕВІРКА ДАНИХ =====
SELECT COUNT(*) as total_listings FROM listings;
SELECT * FROM listings ORDER BY created_at DESC;
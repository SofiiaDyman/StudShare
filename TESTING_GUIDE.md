#  Інструкція з тестування StudShare

## Завантаження проекту

Спочатку потрібно клонувати репозиторій:
```bash
git clone https://github.com/sofiiadyman/studshare
```

```bash
cd student-housing
```

## 1. Запуск проекту

### 1.1. Підготовка бази даних
1. Відкрий термінал у корені проекту.
2. Створи базу даних та таблиці:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Перевір, що дані є:
   ```sql
   USE student_housing;
   SELECT COUNT(*) FROM listings;
   ```

### 1.2. Запуск backend
1. Перейди у папку backend:
   ```bash
   cd backend
   ```
2. Створи файл `.env` і налаштуй:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=твій_пароль
   DB_NAME=student_housing
   PORT=3000
   JWT_SECRET=твій_секретний_ключ
   CLIENT_ORIGIN=http://localhost:5500
   ```
3. Встанови залежності:
   ```bash
   npm install
   ```
4. Запусти сервер у режимі розробки:
   ```bash
   npm run dev
   ```
5. Переконайся, що сервер працює на `http://localhost:3000`.

### 1.3. Запуск frontend
1. Перейди у папку frontend:
   ```bash
   cd frontend
   ```
2. Запусти локальний сервер:
   ```bash
   http-server -p 5500
   ```
3. Відкрий у браузері: [http://localhost:5500](http://localhost:5500)

---

## 2. Тестування у Swagger

Swagger доступний на [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Listings — Операції з оголошеннями про житло

### GET /api/listings
Отримати всі оголошення.
**Swagger:**
1. Відкрий секцію "Listings" → GET /api/listings
2. Натисни "Execute"
3. Має повернути масив оголошень.

### POST /api/listings
Додати нове оголошення (авторизація обов'язкова).
**Swagger:**
1. Авторизуйся через /api/auth/login
2. Введи дані, наприклад:
    ```json
    {
       "gender": "чоловік",
       "faculty": "ФІТ",
       "course": 2,
       "specialty": "Комп'ютерні науки",
       "district": "Центр",
       "address": "вул. Прикладна, 1",
       "rooms_count": 2,
       "people_count": 1,
       "price": 2500,
       "utilities_included": true,
       "additional_info": "Без тварин",
       "contact_phone": "+380123456789",
       "contact_telegram": "@test_user",
       "contact_instagram": "@test_user"
    }
    ```
3. Натисни "Execute"
4. Має повернути ID нового оголошення.

### GET /api/listings/:id
Отримати одне оголошення за ID.
**Swagger:**
1. Введи існуючий ID
2. Натисни "Execute"
3. Має повернути об'єкт оголошення або 404.

### PUT /api/listings/:id
Оновити оголошення (авторизація, власник).
**Swagger:**
1. Авторизуйся
2. Введи ID свого оголошення
3. Введи нові дані, наприклад:
    ```json
    {
       "gender": "жінка",
       "faculty": "ФІТ",
       "course": 3,
       "specialty": "Математика",
       "district": "Сихів",
       "address": "вул. Прикладна, 2",
       "rooms_count": 1,
       "people_count": 2,
       "price": 3000,
       "utilities_included": false,
       "additional_info": "Можна з тваринами",
       "contact_phone": "+380987654321",
       "contact_telegram": "@new_user",
       "contact_instagram": "@new_user"
    }
    ```
4. Натисни "Execute"
5. Має повернути повідомлення про успіх.

### DELETE /api/listings/:id
Видалити оголошення (авторизація, власник).
**Swagger:**
1. Авторизуйся
2. Введи ID свого оголошення
3. Натисни "Execute"
4. Має повернути повідомлення про успіх.

### GET /api/listings/filter
Фільтрувати оголошення за параметрами.
**Swagger:**
1. Введи потрібні параметри (price, district, faculty, gender)
2. Натисни "Execute"
3. Має повернути відфільтрований масив.

---

## Auth — Реєстрація користувачів і вхід

### POST /api/auth/register
Реєстрація нового користувача.
**Swagger:**
1. Введи дані:
    ```json
    {
       "full_name": "Тест Користувач",
       "email": "test@example.com",
       "password": "password123"
    }
    ```
2. Натисни "Execute"
3. Має повернути дані користувача.

### POST /api/auth/login
Вхід користувача.
**Swagger:**
1. Введи email і пароль
2. Натисни "Execute"
3. Має повернути токен і дані користувача.

### POST /api/auth/logout
Вихід з акаунту.
**Swagger:**
1. Натисни "Execute"
2. Має повернути повідомлення про успіх.

### GET /api/auth/me
Отримати поточного користувача (авторизація).
**Swagger:**
1. Авторизуйся
2. Натисни "Execute"
3. Має повернути дані поточного користувача.

---

## Favorites — Керування обраними оголошеннями

### GET /api/favorites
Отримати список обраних оголошень користувача (авторизація).
**Swagger:**
1. Авторизуйся
2. Натисни "Execute"
3. Має повернути масив обраних оголошень.

### POST /api/favorites/:listingId
Додати оголошення в обране (авторизація).
**Swagger:**
1. Авторизуйся
2. Введи ID оголошення
3. Натисни "Execute"
4. Має повернути повідомлення про успіх.

### DELETE /api/favorites/:listingId
Видалити оголошення з обраних (авторизація).
**Swagger:**
1. Авторизуйся
2. Введи ID оголошення
3. Натисни "Execute"
4. Має повернути повідомлення про успіх.

---

## 3. Тестування через frontend

1. Відкрий [http://localhost:5500](http://localhost:5500) у браузері.
2. Зареєструйся та увійди.
3. Додай нове оголошення.
4. Відфільтруй оголошення.
5. Додай улюблене.
6. Перевір, що всі функції працюють.

---

## 4. Вирішення типових проблем

- Якщо не працює авторизація — перевір, що frontend і backend на одному origin (`localhost`).
- Якщо помилка CORS — перевір CLIENT_ORIGIN у `.env` і перезапусти backend.
- Якщо не працює база — перевір підключення та наявність таблиць.
- Перевір консоль браузера (F12) та логи сервера.

---

**Успіхів у тестуванні! **


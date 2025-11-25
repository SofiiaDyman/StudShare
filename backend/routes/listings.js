const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         student_id:
 *           type: string
 *         gender:
 *           type: string
 *         faculty:
 *           type: string
 *         course:
 *           type: integer
 *         specialty:
 *           type: string
 *         district:
 *           type: string
 *         address:
 *           type: string
 *         rooms_count:
 *           type: integer
 *         people_count:
 *           type: integer
 *         price:
 *           type: number
 *         utilities_included:
 *           type: boolean
 *         additional_info:
 *           type: string
 *         contact_phone:
 *           type: string
 *         contact_telegram:
 *           type: string
 *         contact_instagram:
 *           type: string
 *         created_at:
 *           type: string
 */

// ===== GET: ОТРИМАТИ ВСІ ОГОЛОШЕННЯ =====

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Отримати всі оголошення
 *     description: Повертає список всіх оголошень про житло
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Успішно отримано список
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM listings ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Помилка при отриманні оголошень:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== GET: ОТРИМАТИ ОДНЕ ОГОЛОШЕННЯ ПО ID =====

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Отримати одне оголошення
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успішно знайдено
 *       404:
 *         description: Оголошення не знайдено
 */
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM listings WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Помилка:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== POST: ДОДАТИ НОВЕ ОГОЛОШЕННЯ =====

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Додати нове оголошення
 *     tags: [Listings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Listing'
 *     responses:
 *       201:
 *         description: Оголошення успішно створено
 *       400:
 *         description: Невалідні дані
 */
router.post('/', auth, async (req, res) => {
    const {
        gender, faculty, course, specialty, district, address,
        rooms_count, people_count, price, utilities_included,
        additional_info, contact_phone, contact_telegram, contact_instagram
    } = req.body;

    // Використовуємо ID користувача з токену (безпечніше, ніж приймати студентський id з клієнта)
    const student_id = `user_${req.user.id}`;

    // Валідація обов'язкових полів
    if (!student_id || !gender || !faculty || !course || !specialty || 
        !district || !address || !rooms_count || !people_count || !price || !contact_phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO listings 
            (student_id, gender, faculty, course, specialty, district, address, 
             rooms_count, people_count, price, utilities_included, additional_info, 
             contact_phone, contact_telegram, contact_instagram) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, gender, faculty, course, specialty, district, address,
             rooms_count, people_count, price, utilities_included || false,
             additional_info, contact_phone, contact_telegram, contact_instagram]
        );
        
        res.status(201).json({ 
            message: 'Listing created successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Помилка при додаванні:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== PUT: ОНОВИТИ ОГОЛОШЕННЯ =====

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Оновити оголошення
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Listing'
 *     responses:
 *       200:
 *         description: Успішно оновлено
 *       404:
 *         description: Оголошення не знайдено
 */
router.put('/:id', async (req, res) => {
    const {
        gender, faculty, course, specialty, district, address,
        rooms_count, people_count, price, utilities_included,
        additional_info, contact_phone, contact_telegram, contact_instagram
    } = req.body;

    try {
        // Перевіряємо, чи існує оголошення та чи належить воно користувачу
        const [existingRows] = await db.query('SELECT student_id FROM listings WHERE id = ?', [req.params.id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        const ownerId = existingRows[0].student_id;
        // Очікуємо формат `user_<id>`
        // Якщо middleware не підключений, віддаємо 401
        if (!req.headers.authorization && !req.cookies?.token) {
            // Неавторизований запит
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Спробуємо витягнути id користувача з токену (middleware краще підключити на маршрут)
        // Для надійності додамо авторизацію на цей маршрут також
        const authMiddleware = require('../middleware/auth');
        await new Promise((resolve, reject) => {
            authMiddleware(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const currentUserId = `user_${req.user.id}`;
        if (ownerId !== currentUserId) {
            return res.status(403).json({ error: 'Forbidden: you are not the owner' });
        }

        const [result] = await db.query(
            `UPDATE listings 
            SET gender = ?, faculty = ?, course = ?, specialty = ?, 
                district = ?, address = ?, rooms_count = ?, people_count = ?,
                price = ?, utilities_included = ?, additional_info = ?,
                contact_phone = ?, contact_telegram = ?, contact_instagram = ?
            WHERE id = ?`,
            [gender, faculty, course, specialty, district, address,
             rooms_count, people_count, price, utilities_included,
             additional_info, contact_phone, contact_telegram, contact_instagram,
             req.params.id]
        );

        res.json({ message: 'Listing updated successfully' });
    } catch (error) {
        console.error('Помилка оновлення:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Database error' });
    }
});

// ===== DELETE: ВИДАЛИТИ ОГОЛОШЕННЯ =====

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Видалити оголошення
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успішно видалено
 *       404:
 *         description: Оголошення не знайдено
 */
router.delete('/:id', async (req, res) => {
    try {
        // Перевіряємо власника оголошення
        const [existingRows] = await db.query('SELECT student_id FROM listings WHERE id = ?', [req.params.id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        // Перевіряємо авторизацію
        const authMiddleware = require('../middleware/auth');
        await new Promise((resolve, reject) => {
            authMiddleware(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const ownerId = existingRows[0].student_id;
        const currentUserId = `user_${req.user.id}`;
        if (ownerId !== currentUserId) {
            return res.status(403).json({ error: 'Forbidden: you are not the owner' });
        }

        const [result] = await db.query('DELETE FROM listings WHERE id = ?', [req.params.id]);
        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Помилка видалення:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Database error' });
    }
});

// ===== GET: ФІЛЬТРАЦІЯ ОГОЛОШЕНЬ =====

/**
 * @swagger
 * /api/listings/filter:
 *   get:
 *     summary: Фільтрувати оголошення
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         description: Максимальна ціна
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Район
 *       - in: query
 *         name: faculty
 *         schema:
 *           type: string
 *         description: Факультет
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Стать
 *     responses:
 *       200:
 *         description: Відфільтровані оголошення
 */
router.get('/filter', async (req, res) => {
    const { price, district, faculty, gender } = req.query;
    
    let query = 'SELECT * FROM listings WHERE 1=1';
    const params = [];

    if (price) {
        query += ' AND price <= ?';
        params.push(price);
    }
    if (district) {
        query += ' AND district = ?';
        params.push(district);
    }
    if (faculty) {
        query += ' AND faculty = ?';
        params.push(faculty);
    }
    if (gender) {
        query += ' AND gender = ?';
        params.push(gender);
    }

    query += ' ORDER BY created_at DESC';

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Помилка фільтрації:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
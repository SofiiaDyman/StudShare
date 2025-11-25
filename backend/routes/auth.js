const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const signToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        { id: user.id, full_name: user.full_name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const cookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction
    };
};

const setAuthCookie = (res, token) => {
    res.cookie('token', token, cookieOptions());
};

const clearAuthCookie = (res) => {
    res.clearCookie('token', cookieOptions());
};

const sanitizeUser = (user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    created_at: user.created_at
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Іван Студент
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *     responses:
 *       201:
 *         description: Користувача створено, повертається профіль
 *       400:
 *         description: Невалідні дані
 *       409:
 *         description: Email вже використовується
 */
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'full_name, email і password є обовʼязковими' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Користувач з таким email вже існує' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [full_name, email.toLowerCase(), passwordHash]
        );

        const [createdRows] = await db.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        const user = createdRows[0];
        const token = signToken(user);
        setAuthCookie(res, token);

        res.status(201).json({ user: sanitizeUser(user) });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Не вдалося створити користувача' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вхід користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *     responses:
 *       200:
 *         description: Авторизація успішна
 *       400:
 *         description: Неповні дані
 *       401:
 *         description: Невірні облікові дані
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email і password є обовʼязковими' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Невірні облікові дані' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Невірні облікові дані' });
        }

        const token = signToken(user);
        setAuthCookie(res, token);

        res.json({ user: sanitizeUser(user) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Не вдалося виконати вхід' });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Вихід з акаунту
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Cookie очищено
 */
router.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ message: 'Вихід успішний' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Отримати поточного користувача
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані профілю
 *       401:
 *         description: Неавторизовано
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Не вдалося отримати дані профілю' });
    }
});

module.exports = router;


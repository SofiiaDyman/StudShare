const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const ensureListingExists = async (listingId) => {
    const [rows] = await db.query('SELECT id FROM listings WHERE id = ?', [listingId]);
    return rows.length > 0;
};

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Отримати список обраних оголошень користувача
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Масив оголошень
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 *       401:
 *         description: Неавторизовано
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT l.* 
             FROM favorite_listings f
             JOIN listings l ON l.id = f.listing_id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [req.user.id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Favorites fetch error:', error);
        res.status(500).json({ error: 'Не вдалося отримати обрані оголошення' });
    }
});

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   post:
 *     summary: Додати оголошення в обране
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID оголошення
 *     responses:
 *       201:
 *         description: Оголошення додано
 *       400:
 *         description: Невірний ID
 *       401:
 *         description: Неавторизовано
 *       404:
 *         description: Оголошення не знайдено
 */
router.post('/:listingId', authMiddleware, async (req, res) => {
    const listingId = Number(req.params.listingId);

    if (Number.isNaN(listingId)) {
        return res.status(400).json({ error: 'Невірний ідентифікатор оголошення' });
    }

    try {
        const exists = await ensureListingExists(listingId);
        if (!exists) {
            return res.status(404).json({ error: 'Оголошення не знайдено' });
        }

        await db.query(
            `INSERT INTO favorite_listings (user_id, listing_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
            [req.user.id, listingId]
        );

        res.status(201).json({ message: 'Оголошення додано до обраних' });
    } catch (error) {
        console.error('Favorite add error:', error);
        res.status(500).json({ error: 'Не вдалося додати в обрані' });
    }
});

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   delete:
 *     summary: Видалити оголошення з обраних
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Видалено
 *       400:
 *         description: Невірний ID
 *       401:
 *         description: Неавторизовано
 */
router.delete('/:listingId', authMiddleware, async (req, res) => {
    const listingId = Number(req.params.listingId);

    if (Number.isNaN(listingId)) {
        return res.status(400).json({ error: 'Невірний ідентифікатор оголошення' });
    }

    try {
        await db.query(
            'DELETE FROM favorite_listings WHERE user_id = ? AND listing_id = ?',
            [req.user.id, listingId]
        );

        res.json({ message: 'Оголошення вилучено з обраних' });
    } catch (error) {
        console.error('Favorite remove error:', error);
        res.status(500).json({ error: 'Не вдалося видалити з обраних' });
    }
});

module.exports = router;


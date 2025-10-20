const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

// CORS - дозволяє frontend спілкуватися з backend
app.use(cors());

// Парсинг JSON даних з запитів
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Логування всіх запитів
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ===== ROUTES =====

// Підключення маршрутів для оголошень
const listingsRoutes = require('./routes/listings');
app.use('/api/listings', listingsRoutes);

// Головна сторінка API
app.get('/', (req, res) => {
    res.json({
        message: ' StudShare API is running!',
        version: '1.0.0',
        endpoints: {
            listings: '/api/listings',
            documentation: '/api-docs'
        }
    });
});

// Swagger документація
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Обробка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ===== ЗАПУСК СЕРВЕРА =====

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log(` Server started successfully!`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(` Started at: ${new Date().toLocaleString('uk-UA')}`);
    console.log('═══════════════════════════════════════');
});
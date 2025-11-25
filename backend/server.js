const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET не задано у .env. Автентифікація може не працювати.');
}

// ===== MIDDLEWARE =====

// CORS - дозволяє frontend спілкуватися з backend
// Дозволяємо різні джерела для розробки
const allowedOrigins = process.env.CLIENT_ORIGIN 
    ? process.env.CLIENT_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null'];

app.use(cors({
    origin: function (origin, callback) {
        // Дозволяємо запити без origin (наприклад, з Postman, Swagger)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('null')) {
            callback(null, true);
        } else {
            callback(null, true); // Для розробки дозволяємо всі джерела
        }
    },
    credentials: true
}));

// Парсинг JSON даних з запитів
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Логування всіх запитів
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ===== ROUTES =====

// Підключення маршрутів
const listingsRoutes = require('./routes/listings');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

app.use('/api/listings', listingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Головна сторінка API
app.get('/', (req, res) => {
    res.json({
        message: ' StudShare API is running!',
        version: '1.0.0',
        endpoints: {
            listings: '/api/listings',
            favorites: '/api/favorites',
            auth: '/api/auth',
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
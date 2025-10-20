const mysql = require('mysql2');
require('dotenv').config();

// Створення пулу з'єднань з базою даних
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Тестування з'єднання
pool.getConnection((err, connection) => {
    if (err) {
        console.error(' Помилка підключення до MySQL:', err.message);
        console.error('Перевір:');
        console.error('1. Чи запущений MySQL?');
        console.error('2. Чи правильний пароль у файлі .env?');
        console.error('3. Чи існує база даних student_housing?');
    } else {
        console.log(' Успішно підключено до MySQL!');
        connection.release();
    }
});

// Експорт промісифікованого pool для async/await
const promisePool = pool.promise();

module.exports = promisePool;
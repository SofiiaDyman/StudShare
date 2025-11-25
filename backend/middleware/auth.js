const jwt = require('jsonwebtoken');

/**
 * Middleware для перевірки JWT токену з cookie або заголовка Authorization.
 * Додає `req.user` при успіху.
 */
module.exports = function authMiddleware(req, res, next) {
    const bearer = req.headers.authorization;
    const headerToken = bearer?.startsWith('Bearer ') ? bearer.slice(7) : null;
    const token = req.cookies?.token || headerToken;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id, full_name: payload.full_name, email: payload.email };
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};


const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudShare API',
      version: '1.0.0',
      description: 'API для веб-сайту пошуку житла студентами ЛНУ імені Івана Франка',
      contact: {
        name: 'StudShare Support',
        email: 'support@studshare.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Listings',
        description: 'Операції з оголошеннями про житло'
      },
      {
        name: 'Auth',
        description: 'Реєстрація користувачів і вхід'
      },
      {
        name: 'Favorites',
        description: 'Керування обраними оголошеннями'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT токен, що повертається після /auth/login або /auth/register'
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
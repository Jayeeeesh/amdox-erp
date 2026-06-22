const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'Amdox ERP API',
      version: '1.0.0',
      description:
        'AI-Powered Cloud ERP Suite REST API Documentation',
      contact: {
        name: 'Amdox Team',
      },
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: 'Development Server',
      },
      {
        url: process.env.PRODUCTION_URL,
        description: 'Production Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            data: {},
          },
        },

        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
            },
          },
        },

        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '665abc123456',
            },
            name: {
              type: 'string',
              example: 'Jayesh',
            },
            email: {
              type: 'string',
              example: 'jayesh@example.com',
            },
            role: {
              type: 'string',
              example: 'admin',
            },
          },
        },
      },
    },

    tags: [
      {
        name: 'Auth',
        description: 'Authentication APIs',
      },
      {
        name: 'Users',
        description: 'User Management APIs',
      },
      {
        name: 'HR',
        description: 'HR Module APIs',
      },
      {
        name: 'Finance',
        description: 'Finance Module APIs',
      },
    ],
  },

  apis: [
    './src/modules/**/*.routes.js',
    './src/modules/**/*.controller.js',
  ],
};

module.exports = swaggerJsdoc(options);
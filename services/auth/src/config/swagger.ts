import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication service for Sportshop application',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
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
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'user@example.com', 
              description: 'Valid email address, max 254 characters' 
            },
            password: { 
              type: 'string', 
              format: 'password', 
              example: 'pass123', 
              description: 'Min 6 characters, must contain letters and numbers, max 72 characters' 
            },
            name: { 
              type: 'string', 
              example: 'John Doe', 
              description: 'Optional, max 100 characters' 
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'user@example.com', 
              description: 'Valid email address, max 254 characters' 
            },
            password: { 
              type: 'string', 
              format: 'password', 
              example: 'pass123', 
              description: 'Min 6 characters, must contain letters and numbers, max 72 characters' 
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer', 
              example: 1,
              description: 'Unique user identifier'
            },
            email: { 
              type: 'string', 
              example: 'user@example.com', 
              description: 'User email address' 
            },
            name: { 
              type: 'string', 
              nullable: true, 
              example: 'John Doe', 
              description: 'Display name' 
            },
            role: { 
              type: 'string', 
              enum: ['customer', 'admin'], 
              example: 'customer', 
              description: 'User role' 
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time', 
              description: 'Account creation timestamp' 
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time', 
              description: 'Last update timestamp' 
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { 
              $ref: '#/components/schemas/User' 
            },
            token: { 
              type: 'string', 
              example: 'eyJhbGciOiJIUzI1NiIs...',
              description: 'JWT access token'
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { 
              type: 'string', 
              description: 'Error message' 
            },
          },
        },
      },
    },
  },
  apis: isDev 
    ? ['./src/routes/*.ts']   // local development
    : [path.join(__dirname, '../routes/*.js')], // Docker (compiled files)
};

export const swaggerSpec = swaggerJsdoc(options);

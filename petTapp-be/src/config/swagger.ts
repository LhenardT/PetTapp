import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetTapp Backend API',
      version: '1.0.0',
      description: 'API documentation for PetTapp backend application',
      contact: {
        name: 'API Support',
        email: 'support@pettapp.com',
      },
    },
    servers: [
      {
        url: config.API_URL || `http://localhost:${config.PORT}`,
        description: config.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        UserRoles: {
          type: 'object',
          description: 'User role definitions and their capabilities',
          properties: {
            'pet-owner': {
              type: 'string',
              description: '🐕 Pet Owner - Can manage own pets and make bookings',
              example: 'pet-owner'
            },
            'business-owner': {
              type: 'string',
              description: '🏢 Business Owner - Can manage own business and services',
              example: 'business-owner'
            },
            'admin': {
              type: 'string',
              description: '👑 Admin - Full system access and management',
              example: 'admin'
            }
          }
        }
      },
      parameters: {
        roleAccess: {
          name: 'x-role-access',
          in: 'header',
          description: 'Role-based access information for this endpoint',
          schema: {
            type: 'string'
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: '🔐 Authentication endpoints - Available to all users',
        externalDocs: {
          description: 'Role permissions guide',
          url: '#'
        }
      },
      {
        name: 'Health',
        description: '💚 Health check endpoints - Public access',
      },
      {
        name: 'Users',
        description: '👤 User profile management - 🐕 Pet Owner | 🏢 Business Owner | 👑 Admin',
      },
      {
        name: 'Pets',
        description: '🐕 Pet management - 🐕 Pet Owner (own pets) | 👑 Admin (all pets)',
      },
      {
        name: 'Businesses',
        description: '🏢 Business management - 🌐 Public (read) | 🏢 Business Owner (own) | 👑 Admin (all)',
      },
      {
        name: 'Services',
        description: '🛎️ Service management - 🌐 Public (read) | 🏢 Business Owner (own) | 👑 Admin (all)',
      },
      {
        name: 'Bookings',
        description: '📅 Booking management - 🐕 Pet Owner (create/rate) | 🏢 Business Owner (manage) | 👑 Admin (all)',
      },
      {
        name: 'Admin',
        description: '👑 Admin management - Admin access only',
      },
    ],
  },
  apis: [
    // Relative paths from project root
    './src/routes/*.ts',
    './src/app.ts',
    './src/models/*.ts'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'path';
import swaggerUiDist from 'swagger-ui-dist';
import fs from 'fs';

import productRoutes from './routes/product.routes';
import { authPlugin } from './plugins/auth';
import { validateEnv, checkJwtSecret, getPort } from './config/env';

validateEnv();
checkJwtSecret();

const fastify = Fastify({
  logger: true,
});

// ==================== SCHEMA ====================
fastify.addSchema({
  $id: 'Product',
  type: 'object',
  description: 'Product entity',

  properties: {
    id: {
      type: 'integer',
      description: 'Unique product ID',
      example: 1,
    },
    name: {
      type: 'string',
      description: 'Product name',
      example: 'Nike Air Max',
    },
    description: {
      type: 'string',
      nullable: true,
      description: 'Detailed product description',
      example: 'Comfortable running shoes',
    },
    price: {
      type: 'number',
      description: 'Product price in USD',
      example: 99.99,
    },
    stock: {
      type: 'integer',
      description: 'Available stock quantity',
      example: 10,
    },
    category: {
      type: 'string',
      description: 'Product category',
      example: 'Shoes',
    },
    imageUrl: {
      type: 'string',
      nullable: true,
      description: 'URL to product image',
      example: 'https://example.com/image.jpg',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Creation timestamp',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
    },
  },
});

const start = async () => {
  // ==================== RATE LIMITING ====================
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ==================== PLUGINS ====================
  await fastify.register(cors, {
    origin: true,
  });
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/products/assets/',
  });
  await fastify.register(authPlugin);

  // ==================== HEALTH (hidden) ===================
  fastify.get('/health', async () => ({ status: 'OK', service: 'product' }));

  // ==================== SWAGGER ====================
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Product Service API',
        version: '1.0.0',
        description: 'Product management for Sportshop',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  // ==================== FAVICON (CORRECT) ====================
  const swaggerRoot = swaggerUiDist.getAbsoluteFSPath();

  await fastify.register(swaggerUi, {
  routePrefix: '/api-docs',
  uiConfig: {
    docExpansion: 'list',
    defaultModelExpandDepth: 1,
  },
  theme: {
    favicon: [
      {
        filename: 'favicon-32x32.png',
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        content: fs.readFileSync(
          path.join(swaggerRoot, 'favicon-32x32.png')
        ),
      },
      {
        filename: 'favicon-16x16.png',
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        content: fs.readFileSync(
          path.join(swaggerRoot, 'favicon-16x16.png')
        ),
      },
    ],
  },
});
  
  // ==================== ROUTES ====================
  await fastify.register(productRoutes, { prefix: '/products' });

  // ==================== SERVER ====================
  const PORT = getPort();
  await fastify.listen({ port: PORT, host: '0.0.0.0' });

  console.log(`🚀 Product service running on port ${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
};

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});

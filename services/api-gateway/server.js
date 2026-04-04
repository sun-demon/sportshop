const express = require('express');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');

const app = express();

const SERVICES = [
  { name: 'Auth', url: 'http://auth-service:3001/api-docs/json', tag: 'Auth' },
  { name: 'Product', url: 'http://product-service:3002/api-docs/json', tag: 'Products' },
  { name: 'Order', url: 'http://order-service:3003/api-docs/json', tag: 'Orders' },
];

async function aggregateSwagger() {
  const aggregated = {
    openapi: '3.0.0',
    info: {
      title: 'Sportshop API Gateway',
      version: '1.0.0',
      description: 'Unified API documentation for all Sportshop microservices',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Auth Service' },
      { url: 'http://localhost:3002', description: 'Product Service' },
      { url: 'http://localhost:3003', description: 'Order Service' },
    ],
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };

  for (const service of SERVICES) {
    try {
      console.log(`📥 Fetching ${service.name} spec from ${service.url}`);
      const response = await axios.get(service.url);
      const spec = response.data;
      
      // Добавляем paths с префиксом
      if (spec.paths) {
        for (const [path, methods] of Object.entries(spec.paths)) {
          const prefixedPath = path.startsWith('/') ? path : `/${path}`;
          aggregated.paths[prefixedPath] = methods;
        }
      }
      
      // Добавляем схемы из components
      if (spec.components?.schemas) {
        if (!aggregated.components.schemas) {
          aggregated.components.schemas = {};
        }
        Object.assign(aggregated.components.schemas, spec.components.schemas);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${service.name} spec:`, error.message);
    }
  }
  
  return aggregated;
}

let cachedSpec = null;

app.get('/api-docs/json', async (req, res) => {
  if (!cachedSpec) {
    cachedSpec = await aggregateSwagger();
  }
  res.json(cachedSpec);
});

app.use('/api-docs', swaggerUi.serve, async (req, res, next) => {
  if (!cachedSpec) {
    cachedSpec = await aggregateSwagger();
  }
  return swaggerUi.setup(cachedSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      urls: [
        { url: '/api-docs/json', name: 'Sportshop API' },
      ],
    },
  })(req, res, next);
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});

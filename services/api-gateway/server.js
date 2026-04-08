const express = require('express');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy for requests to microservices
app.use(createProxyMiddleware({
  target: 'http://auth-service:3001',
  changeOrigin: true,
  pathFilter: '/auth'
}));

app.use(createProxyMiddleware({
  target: 'http://product-service:3002',
  changeOrigin: true,
  pathFilter: '/products'
}));

app.use(createProxyMiddleware({
  target: 'http://order-service:3003',
  changeOrigin: true,
  pathFilter: '/orders'
}));

// Health check endpoint
app.get('/health', async (req, res) => {
  const check = async (name, port) => {
    try {
      await axios.get(`http://${name}-service:${port}/health`, { timeout: 2000 });
      return [name, 'OK'];
    } catch {
      return [name, 'DOWN'];
    }
  };
  
  const services = await Promise.all([
    check('auth', 3001),
    check('product', 3002),
    check('order', 3003)
  ]);
  
  const health = {
    gateway: 'OK',
    timestamp: new Date().toISOString(),
    services: Object.fromEntries(services)
  };
  
  res.status(health.services.auth === 'DOWN' || health.services.product === 'DOWN' || health.services.order === 'DOWN' ? 503 : 200).json(health);
});

// Swagger aggregation
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
      
      // Adding paths with the prefix
      if (spec.paths) {
        for (const [path, methods] of Object.entries(spec.paths)) {
          const prefixedPath = path.startsWith('/') ? path : `/${path}`;
          aggregated.paths[prefixedPath] = methods;
        }
      }
      
      // Adding schemas from components
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
      urls: [{ url: '/api-docs/json', name: 'Sportshop API' }],
    },
  })(req, res, next);
});

app.get('/', (req, res) => res.redirect('/api-docs'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🔀 Proxy: /auth/* → auth-service:3001`);
  console.log(`🔀 Proxy: /products/* → product-service:3002`);
  console.log(`🔀 Proxy: /orders/* → order-service:3003`);
});

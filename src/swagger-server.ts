import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

/**
 * Create Swagger UI server on a separate port
 */
export function createSwaggerServer() {
  const app = express();

  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Teamtailor CSV Export API Documentation',
    })
  );

  // Health check for Swagger server
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Swagger UI server is running',
    });
  });

  // Root redirect to API docs
  app.get('/', (_req, res) => {
    res.redirect('/api-docs');
  });

  return app;
}

/**
 * Start Swagger UI server
 */
export function startSwaggerServer(port: number = 3003) {
  const app = createSwaggerServer();

  app.listen(port, () => {
    console.log(`Swagger UI server running on http://localhost:${port}`);
    console.log(`API documentation available at http://localhost:${port}/api-docs`);
  });

  return app;
}

// If this file is run directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.SWAGGER_PORT || '3003', 10);
  startSwaggerServer(port);
}
# Swagger UI Implementation

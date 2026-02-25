import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import { exportRouter } from './routes/export.js';
import { swaggerSpec } from './docs/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create Express application with configured middleware and routes
 */
export function createApp() {
  const app = express();

  // Request logging with Morgan
  app.use(morgan('dev'));

  // Middleware: Parse JSON request bodies
  app.use(express.json());

  // Middleware: Serve static files from public directory
  app.use(express.static(path.join(__dirname, '../public')));

  /**
   * Health check endpoint
   * @route GET /health
   * @group Health - Health check operations
   * @returns {object} 200 - Success response
   * @returns {string} 500 - Server error
   */
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * OpenAPI specification endpoint
   * @route GET /api-docs.json
   * @group Documentation - API documentation
   * @returns {object} 200 - OpenAPI specification
   * @returns {string} 500 - Server error
   */
  // OpenAPI specification endpoint
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  // Routes: CSV export endpoints
  app.use('/api/export', exportRouter);

  return app;
}

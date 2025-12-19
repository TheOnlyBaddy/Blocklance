// Express app factory: applies middleware, routes, and error handling
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authAny } from './middlewares/authAny.js';
import { roleCheck } from './middlewares/roleCheck.js';
import blockchainRoutes from './routes/blockchain.routes.js';

export function createApp() {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Configure CORS: update origin as needed
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  );

  // Logging (pretty): "GET /path → 200 (X.XXX ms)"
  app.use(
    morgan((tokens, req, res) => {
      const method = tokens.method(req, res);
      const url = tokens.url(req, res);
      const status = tokens.status(req, res);
      const rt = tokens['response-time'](req, res);
      return `  ${method} ${url} → ${status} (${rt} ms)`;
    })
  );

  // Healthcheck
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API routes
  app.use('/api', routes);
  app.use('/api/blockchain', blockchainRoutes);
  // Backward-compat: also mount at root so clients without /api prefix still work
  app.use('/', routes);

  // Quick role test endpoint
  app.get('/api/test/role', authAny, roleCheck('client', 'freelancer'), (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}



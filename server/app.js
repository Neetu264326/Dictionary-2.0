import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dictionaryRoutes from './routes/dictionaryRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env when present (Node >= 20.12). Never fails if the file is missing.
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
  /* no .env file — defaults are used */
}

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET'],
  })
);

app.get('/', (_req, res) => {
  res.json({
    service: 'dictionary-2.0',
    status: 'ok',
    health: '/api/health',
  });
});

app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'dictionary-2.0',
    provider: process.env.DICTIONARY_PROVIDER || 'free',
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api/dictionary', dictionaryRoutes);
app.use('/api', notFoundHandler('API route not found.'));

// Serve the built client in production so nested routes refresh correctly.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

app.use(notFoundHandler('Route not found.'));
app.use(errorHandler);

export default app;

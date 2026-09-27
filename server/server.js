import app from './app.js';
import { warmup } from './services/dictionaryService.js';

// Vercel imports the default export as its request handler. Locally, retain
// the standalone HTTP server used by `npm start` and `npm run dev`.
export default app;

if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 5000;

  const server = app.listen(PORT, () => {
    console.log(`\n  Dictionary 2.0 API`);
    console.log(`  → http://localhost:${PORT}`);
    console.log(`  → health: http://localhost:${PORT}/api/health\n`);
    warmup();
  });

  const close = (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on('SIGINT', () => close('SIGINT'));
  process.on('SIGTERM', () => close('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason instanceof Error ? reason.message : reason);
  });
}

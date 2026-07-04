import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';

dotenv.config();

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // This endpoint acknowledges the score submission. It does not send email
  // unless a real mail provider is configured separately.
  app.post('/api/send-result', (req, res) => {
    const { name, score, total, passed, email } = req.body ?? {};

    if (typeof name !== 'string' || typeof score !== 'number' || typeof total !== 'number') {
      res.status(400).json({ success: false, message: 'Invalid result payload.' });
      return;
    }

    console.log('Game result received:', { name, score, total, passed, email });
    res.json({ success: true, delivered: false });
  });

  if (process.env.NODE_ENV === 'production') {
    const clientDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(clientDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`2D Jump High is running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

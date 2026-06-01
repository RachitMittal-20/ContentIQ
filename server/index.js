import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import analyzeRoute from './routes/analyze.js';
import chatRoute from './routes/chat.js';
import metadataRoute from './routes/metadata.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://contentiq.vercel.app'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', analyzeRoute);
app.use('/api', chatRoute);
app.use('/api', metadataRoute);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[ContentIQ] Server listening on port ${port}`);
});


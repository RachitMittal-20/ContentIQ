import express from 'express';
import { sessionStore } from '../store.js';

const router = express.Router();

router.get('/metadata', async (_req, res) => {
  try {
    return res.json({
      success: true,
      lastRunAt: sessionStore.lastRunAt,
      metadataA: sessionStore.metadataByVideoId.A,
      metadataB: sessionStore.metadataByVideoId.B,
    });
  } catch (err) {
    console.error('[ContentIQ] /api/metadata error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load metadata' });
  }
});

export default router;


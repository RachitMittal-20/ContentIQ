import express from 'express';
import { handleAnalyze } from '../services/ragService.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { videoA, videoB } = req.body || {};
    if (!videoA || !videoB) {
      return res.status(400).json({ success: false, error: 'videoA and videoB are required' });
    }

    const result = await handleAnalyze({ videoA, videoB });
    return res.json(result);
  } catch (err) {
    console.error('[ContentIQ] /api/analyze error:', err);
    return res.status(500).json({ success: false, error: 'Failed to analyze videos' });
  }
});

export default router;


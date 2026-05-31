import express from 'express';
import { handleChatStream } from '../services/ragService.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message, history = [], metadata } = req.body || {};

  try {
    if (!message) return res.status(400).json({ success: false, error: 'message is required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await handleChatStream({ res, message, history, metadata });
  } catch (err) {
    console.error('[ContentIQ] /api/chat error:', err);
    res.write(`data: ${JSON.stringify({ done: true, error: 'Failed to chat' })}\n\n`);
    res.end();
  }
});

export default router;


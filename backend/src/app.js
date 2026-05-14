/**
 * EXPRESS APP
 *
 * Main Express application setup.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import gameRoutes from './routes/gameRoutes.js';
import { log } from './utils/helpers.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log('info', `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use('/api/game', gameRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'AI Akinator - IPL Players',
    version: '1.0.0',
    description: 'An AI-powered IPL player guessing game',
    endpoints: {
      health: 'GET /api/game/health',
      start: 'POST /api/game/start',
      answer: 'POST /api/game/:sessionId/answer',
      feedback: 'POST /api/game/:sessionId/feedback',
      status: 'GET /api/game/:sessionId'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND'
    }
  });
});

app.use((err, req, res, next) => {
  log('error', `Unhandled error: ${err.message}`);
  log('error', err.stack);

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
});

export default app;
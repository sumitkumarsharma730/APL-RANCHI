/**
 * SERVER ENTRY POINT
 *
 * Starts the Express server.
 */

import app from './app.js';
import { loadPlayers, loadQuestions } from './data/loader.js';
import { getSessionCount } from './sessions/sessions.js';
import { log } from './utils/helpers.js';

// Load data on startup
console.log('Loading game data...');
const players = loadPlayers();
const questions = loadQuestions();

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   🏏  AI AKINATOR - IPL PLAYERS  🏏                        ║');
  console.log('║                                                            ║');
  console.log('║   Probabilistic AI Reasoning Engine                       ║');
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║   Server running on: http://${HOST}:${PORT}                 ║`);
  console.log(`║   Players loaded: ${players.length.toString().padEnd(24)}                  ║`);
  console.log(`║   Questions loaded: ${questions.length.toString().padEnd(23)}                ║`);
  console.log('║                                                            ║');
  console.log('║   Endpoints:                                              ║');
  console.log('║   - POST /api/game/start    - Start new game              ║');
  console.log('║   - POST /api/game/:id/answer - Submit answer              ║');
  console.log('║   - GET  /api/game/:id      - Get game state               ║');
  console.log('║   - GET  /api/game/health   - Health check                 ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  log('info', `Server started on port ${PORT}`);
  log('info', `Loaded ${players.length} players and ${questions.length} questions`);
});
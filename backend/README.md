# AI Akinator for IPL Players - Backend

A probabilistic reasoning engine that guesses IPL players through intelligent questioning.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start Server

```bash
npm start
# Server runs on http://localhost:3001
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### Start New Game
```bash
POST /api/game/start

Response:
{
  "success": true,
  "sessionId": "uuid",
  "question": { "id": 1, "text": "...", "category": "..." },
  "questionNumber": 0,
  "confidence": 0.004,
  "remainingCandidates": 40
}
```

### Submit Answer
```bash
POST /api/game/:sessionId/answer
{
  "questionId": 1,
  "answer": "yes"  # yes | no | maybe | dont_know
}

Response (continue):
{
  "success": true,
  "status": "continue",
  "question": { "id": 2, "text": "...", "category": "..." },
  "confidence": 0.15,
  "remainingCandidates": 28,
  "questionNumber": 1
}

Response (guess):
{
  "success": true,
  "status": "guess",
  "player": { "id": "ms_dhoni_001", "name": "MS Dhoni", "role": "..." },
  "confidence": 0.85
}
```

### Submit Feedback
```bash
POST /api/game/:sessionId/feedback
{
  "correct": true  # or false
}
```

### Get Game State
```bash
GET /api/game/:sessionId
```

### Health Check
```bash
GET /api/game/health
```

## Project Structure

```
backend/
├── src/
│   ├── data/
│   │   ├── players.json    # Player database (40+ players)
│   │   ├── questions.json  # Question bank (60 questions)
│   │   └── loader.js       # Data loading utilities
│   │
│   ├── engines/
│   │   ├── entropyCalculator.js   # Shannon entropy calculations
│   │   ├── probabilityEngine.js  # Bayesian probability updates
│   │   ├── questionSelector.js   # Optimal question selection
│   │   └── reasoningEngine.js    # Main game orchestration
│   │
│   ├── routes/
│   │   └── gameRoutes.js   # API endpoints
│   │
│   ├── sessions/
│   │   └── sessions.js     # In-memory session storage
│   │
│   ├── utils/
│   │   └── helpers.js      # Utility functions
│   │
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── package.json
├── .env
└── README.md
```

## How It Works

### 1. Game Start
- Load all 40+ players from database
- Each player gets equal probability (1/N)
- Select the question with highest information gain

### 2. Answer Processing
- Receive answer (yes/no/maybe/dont_know)
- Update player probabilities using Bayesian-style updating
- Normalize probabilities to sum to 1

### 3. Question Selection
- Calculate information gain for each unasked question
- Select question that splits candidates closest to 50/50
- Higher information gain = better question

### 4. Guess Decision
- Make guess when:
  - Confidence >= 80% (top candidate probability)
  - OR effective candidates <= 1.5
  - OR only 3 candidates remain
  - OR 12 questions asked

### 5. Confidence Calculation
- Confidence = probability of top candidate
- Updates after every answer
- Used to decide when to make a guess

## Connecting Frontend

Update your frontend's `api.js`:

```javascript
const API_BASE = 'http://localhost:3001/api'

export const api = {
  async startGame() {
    const response = await fetch(`${API_BASE}/game/start`, { method: 'POST' })
    return response.json()
  },

  async submitAnswer(sessionId, questionId, answer) {
    const response = await fetch(`${API_BASE}/game/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer })
    })
    return response.json()
  },

  async submitFeedback(sessionId, correct) {
    const response = await fetch(`${API_BASE}/game/${sessionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct })
    })
    return response.json()
  }
}
```

## Sample Game Flow

```bash
# 1. Start game
curl -X POST http://localhost:3001/api/game/start

# Response: First question about nationality

# 2. Answer question
curl -X POST http://localhost:3001/api/game/[sessionId]/answer \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "answer": "yes"}'

# Response: Next question OR final guess

# 3. Submit feedback
curl -X POST http://localhost:3001/api/game/[sessionId]/feedback \
  -H "Content-Type: application/json" \
  -d '{"correct": true}'
```

## Key Algorithms

### Entropy Calculation
```javascript
H = -Σ p(x) * log2(p(x))
// Measures uncertainty - max at 50/50 split
```

### Information Gain
```javascript
IG = H_before - H_after
// Higher IG = better question
```

### Probability Update (Bayesian)
```javascript
P(player | answer) = P(answer | player) * P(player) / P(answer)
```

## Environment Variables

Create `.env` file:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Deployment

For production, use:
- Railway (recommended)
- Render
- Heroku
- AWS/Cloud services

```bash
# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
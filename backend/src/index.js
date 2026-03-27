const express = require('express');
const http = require('http');
const cors = require('cors');
const { Pool } = require('pg');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3001;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

// ── REST routes ──

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, password, avatar } = req.body;
    if (!name || !password) return res.status(400).json({ error: 'Name and password are required' });
    // Check if name taken
    const existing = await pool.query('SELECT id FROM players WHERE name = $1', [name]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Player name already taken' });
    const result = await pool.query(
      'INSERT INTO players (name, password, avatar) VALUES ($1, $2, $3) RETURNING id, name, avatar, xp, level',
      [name.trim(), password, avatar || 'piggy']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ error: 'Name and password are required' });
    const result = await pool.query(
      'SELECT id, name, avatar, xp, level FROM players WHERE name = $1 AND password = $2',
      [name.trim(), password]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Wrong player name or password' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save game result
app.post('/api/games', async (req, res) => {
  try {
    const { player_id, score, total_questions, correct_answers, xp_earned } = req.body;
    const result = await pool.query(
      `INSERT INTO game_sessions (player_id, score, total_questions, correct_answers, xp_earned)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [player_id, score, total_questions, correct_answers, xp_earned]
    );
    // Update player xp and level (level up every 100 xp)
    await pool.query(
      'UPDATE players SET xp = xp + $1, level = FLOOR((xp + $1) / 100) + 1 WHERE id = $2',
      [xp_earned, player_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Matchmaking ──

let matchQueue = [];
const rooms = new Map();

async function fetchQuestions(count = 5) {
  const result = await pool.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT $1', [count]);
  return result.rows.map(q => {
    const answers = [
      { text: q.correct_answer, correct: true },
      { text: q.wrong_answer_1, correct: false },
      { text: q.wrong_answer_2, correct: false },
      { text: q.wrong_answer_3, correct: false },
    ];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return { id: q.id, term: q.term, prompt: q.prompt, answers };
  });
}

async function tryMatch() {
  while (matchQueue.length >= 2) {
    const p1 = matchQueue.shift();
    const p2 = matchQueue.shift();

    const s1 = io.sockets.sockets.get(p1.socketId);
    const s2 = io.sockets.sockets.get(p2.socketId);
    if (!s1) { matchQueue.unshift(p2); continue; }
    if (!s2) { matchQueue.unshift(p1); continue; }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const questions = await fetchQuestions(5);

    const room = {
      players: [
        { socketId: p1.socketId, player: p1.player, score: 0, correctCount: 0, currentQ: 0, finished: false },
        { socketId: p2.socketId, player: p2.player, score: 0, correctCount: 0, currentQ: 0, finished: false },
      ],
      questions,
      questionCount: questions.length,
    };
    rooms.set(roomId, room);

    s1.join(roomId);
    s2.join(roomId);
    s1.data.roomId = roomId;
    s2.data.roomId = roomId;

    s1.emit('matched', {
      roomId,
      opponent: { name: p2.player.name, avatar: p2.player.avatar, level: p2.player.level },
      questions,
    });
    s2.emit('matched', {
      roomId,
      opponent: { name: p1.player.name, avatar: p1.player.avatar, level: p1.player.level },
      questions,
    });

    console.log(`Matched: ${p1.player.name} vs ${p2.player.name} in ${roomId}`);
  }

  matchQueue.forEach(entry => {
    const s = io.sockets.sockets.get(entry.socketId);
    if (s) s.emit('queue_update', { position: matchQueue.length });
  });
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_queue', (player) => {
    matchQueue = matchQueue.filter(e => e.socketId !== socket.id);
    matchQueue.push({ socketId: socket.id, player });
    console.log(`${player.name} joined queue (${matchQueue.length} waiting)`);
    socket.emit('queue_update', { position: matchQueue.length });
    tryMatch();
  });

  socket.on('leave_queue', () => {
    matchQueue = matchQueue.filter(e => e.socketId !== socket.id);
  });

  socket.on('answer', ({ roomId, questionIndex, correct, score }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const me = room.players.find(p => p.socketId === socket.id);
    if (!me) return;
    me.score = score;
    me.currentQ = questionIndex + 1;
    if (correct) me.correctCount++;
    const opponent = room.players.find(p => p.socketId !== socket.id);
    if (opponent) {
      const os = io.sockets.sockets.get(opponent.socketId);
      if (os) os.emit('opponent_update', { score: me.score, currentQ: me.currentQ, correctCount: me.correctCount });
    }
  });

  socket.on('finish', ({ roomId, score, correctCount }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const me = room.players.find(p => p.socketId === socket.id);
    if (!me) return;
    me.score = score;
    me.correctCount = correctCount;
    me.finished = true;

    if (room.players.every(p => p.finished)) {
      room.players.forEach(p => {
        const opp = room.players.find(o => o.socketId !== p.socketId);
        const s = io.sockets.sockets.get(p.socketId);
        if (s) {
          s.emit('game_over', {
            your_score: p.score,
            your_correct: p.correctCount,
            opponent_score: opp.score,
            opponent_correct: opp.correctCount,
            opponent_name: opp.player.name,
            total_questions: room.questionCount,
          });
        }
      });
      setTimeout(() => rooms.delete(roomId), 30000);
    } else {
      const opponent = room.players.find(p => p.socketId !== socket.id);
      if (opponent) {
        const os = io.sockets.sockets.get(opponent.socketId);
        if (os) os.emit('opponent_finished', { score: me.score, correctCount: me.correctCount });
      }
    }
  });

  socket.on('disconnect', () => {
    matchQueue = matchQueue.filter(e => e.socketId !== socket.id);
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const opponent = room.players.find(p => p.socketId !== socket.id);
        if (opponent) {
          const os = io.sockets.sockets.get(opponent.socketId);
          if (os) os.emit('opponent_disconnected');
        }
        rooms.delete(roomId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

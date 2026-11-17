require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');
const peerRoutes = require('./routes/peerRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
// Express leaves req.body undefined when a request has no body; handlers expect an object.
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SafeSpace API' });
});

// Register / login are open; every route below requires a signed-in user.
app.use('/api/auth', authRoutes);
app.use('/api', authenticate());

app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api', peerRoutes);
app.use('/api', consultationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`SafeSpace server running`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://192.168.0.111:${PORT}`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { resolveDemoUser } = require('./middleware/demoUser');

const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');
const peerRoutes = require('./routes/peerRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', resolveDemoUser);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SafeSpace API', demoUserId: req.demoUserId });
});

app.use('/api/moods', moodRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api', peerRoutes);
app.use('/api', consultationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () =>
  console.log(`SafeSpace server running at http://localhost:${PORT}`)
);

module.exports = app;

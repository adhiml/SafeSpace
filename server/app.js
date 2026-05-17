require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');
const peerRoutes = require('./routes/peerRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SafeSpace API', user: 'user_001' });
});

app.use('/api/moods', moodRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api', peerRoutes);
app.use('/api', consultationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () =>{ 
  console.log(`SafeSpace server running at http://localhost:${PORT} (emo user only)`);
  console.log(`For Android Emulator use: http://10.0.2.2:${PORT}`);
  console.log(`For physical device use: http://YOUR_IP:${PORT}`);
});

module.exports = app;

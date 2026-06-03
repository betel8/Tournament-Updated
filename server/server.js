require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const matchRoutes = require('./routes/matchRoutes');
const tournamentPlayerRoutes = require('./routes/tournamentPlayerRoutes');
const resultRoutes = require('./routes/resultRoutes'); // Add this line
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Static files with security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/tournament-players', tournamentPlayerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/results', resultRoutes); // Add this line

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
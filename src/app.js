// src/app.js
// Main Express application setup file.
// This file initializes the Express server and configures middleware and routes.

const express = require('express');
const path = require('path');
const config = require('./config'); // We will create this shortly

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files (HTML, CSS, JS for frontend)
// app.use(express.static(path.join(__dirname, '../public'))); // REMOVING THIS LINE

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API routes
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api', quizRoutes);
app.use('/admin', adminRoutes);

// Global error handler (basic)
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(err.status || 500).json({
    error: {
        message: err.message || 'Something broke!',
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Optionally include stack in dev
    }
  });
});

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // console.log(`Access the app at http://localhost:${PORT}/quiz.html`); // REMOVING THIS LINE
  // console.log(`Admin panel at http://localhost:${PORT}/admin.html (V1 - no auth)`); // REMOVING THIS LINE
});

module.exports = app; // For potential testing or programmatic use 
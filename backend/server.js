const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const logger = require('./middleware/logger');

// Import Routes
const plantationRoutes = require('./routes/plantationRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.get('/', require('./controllers/healthController').getRoot);
app.use('/api/health', healthRoutes);
app.use('/api/plantations', plantationRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 API endpoints: http://localhost:${PORT}/api/plantations`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Configurations
require('./src/config/firebase');
const setupSwagger = require('./src/config/swagger');

// Middlewares
const requestLogger = require('./src/middleware/logger');
const apiLimiter = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const { bookRouter, transactionRouter } = require('./src/routes/bookRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

// Security & General Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows Swagger UI assets to load without CSP restrictions
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Logging Middleware
app.use(requestLogger);

// Rate Limiting (100 requests per 15 minutes)
app.use('/api', apiLimiter);

// API Documentation (Swagger)
setupSwagger(app);

// Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Library Management REST API',
    version: '1.0.0',
    documentation: '/api-docs',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/users', userRoutes);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(` Documentation available at: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

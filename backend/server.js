const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const mailRoutes = require('./routes/mail');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bulk_mail_app';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseUri: MONGODB_URI.includes('@') ? 'mongodb-cloud' : MONGODB_URI,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Start Database connection and server
async function startServer() {
  try {
    // Attempt connecting to the configured MongoDB URI (local daemon or Atlas)
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(' Connected to MongoDB!');
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}).`);
    console.log('🔄 Bootstrapping in-memory MongoDB instance for instant execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      MONGODB_URI = mongod.getUri();
      await mongoose.connect(MONGODB_URI);
      console.log(` Embedded MongoDB started successfully at ${MONGODB_URI}`);
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Bulk Mail Server is listening on http://localhost:${PORT}`);
  });
}

startServer();

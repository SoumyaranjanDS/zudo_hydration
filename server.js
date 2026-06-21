const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Adds security headers
app.use(cors());
app.use(express.json());

// Database Connection
const isProdDB = process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zudo';

mongoose.connect(mongoUri).then(() => {
  console.log(`Connected to MongoDB (${isProdDB ? 'Atlas Cloud' : 'Local'})`);
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Models
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HydroQuest API is running' });
});

// Sync User Profile (Create or Update)
app.post('/api/users/sync', async (req, res) => {
  try {
    const { deviceId, biometrics, dailyTargetMl, gamification } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Find user by deviceId and update, or create a new one if it doesn't exist
    const user = await User.findOneAndUpdate(
      { deviceId },
      {
        biometrics,
        dailyTargetMl,
        gamification,
      },
      { returnDocument: 'after', upsert: true }
    );

    console.log(`[SYNC] User profile synced for device: ${deviceId}`);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Log Water Intake
app.post('/api/logs', async (req, res) => {
  try {
    const { deviceId, amountMl, verified, timestamp } = req.body;

    if (!deviceId || !amountMl) {
      return res.status(400).json({ error: 'deviceId and amountMl are required' });
    }

    // Lookup user by deviceId to get their MongoDB _id
    const user = await User.findOne({ deviceId });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sync profile first.' });
    }

    const log = new DailyLog({
      userId: user._id,
      amountMl,
      verified: verified || false,
      timestamp: timestamp ? new Date(timestamp) : Date.now(),
    });

    await log.save();

    console.log(`[LOG] Received ${amountMl}ml from device: ${deviceId}`);
    res.json({ success: true, message: 'Log saved', log });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

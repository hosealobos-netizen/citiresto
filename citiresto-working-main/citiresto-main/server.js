
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const restaurantRoutes = require('./routes/restaurants');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'dbRestaurants';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/restaurants', restaurantRoutes);

app.use('/api', (req, res) =>
  res.status(404).json({ error: 'Unknown API route.' })
);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: Object.values(err.errors)[0].message
    });
  }

  res.status(500).json({
    error: 'Something went wrong on the server. Please try again.'
  });
});

let connectionPromise;

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME
    }).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }

  await connectionPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`CiTiResto is running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Could not connect to MongoDB Atlas:', err.message);
      process.exit(1);
    });
}

module.exports = app;


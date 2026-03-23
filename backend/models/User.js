const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    sparse: true // Allow multiple nulls for uniqueness
  },
  imageUrl: String,
  email: String,
  firstName: String,
  lastName: String,
  // App-specific stats
  problemsSolved: {
    type: Number,
    default: 0
  },
  submissions: [{
    problemId: String,
    language: String,
    status: String, // 'solved', 'attempted'
    solvedAt: Date
  }],
  stats: {
    topics: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 }
    },
    streaks: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    heatmapData: [{
      date: String, // YYYY-MM-DD
      count: Number
    }]
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


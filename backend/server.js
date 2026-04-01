// server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { clerkMiddleware, requireAuth } = require("@clerk/express");

// 
const connectDB = require("./config/db");

const deleteProblemRoute = require("./routes/deleteProblemRoute");
const problemRoutes = require("./routes/problemRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Clerk middleware - backend only uses secret key
app.use(clerkMiddleware());

// Protected route example (optional)
app.get("/protected", requireAuth(), (req, res) => {
  res.json({ message: "You are authenticated!", userId: req.auth.userId });
});
console.log('Clerk PK exists:', !!process.env.CLERK_PUBLISHABLE_KEY);
// API routes
app.use("/api/problems", problemRoutes);
app.use("/api/delete-problem", deleteProblemRoute);

// Test routes
app.get("/ping", (req, res) => res.json({ msg: "pong" }));
app.get("/", (req, res) => res.send("Backend running"));

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
     const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Clerk PK configured: ${!!process.env.CLERK_PUBLISHABLE_KEY}`);
      console.log(`Clerk SK configured: ${!!process.env.CLERK_SECRET_KEY}`);
    });

    // Graceful shutdown on unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection: ', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
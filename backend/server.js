require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

const { createServer } = require('http');
const { setupWebSocketServer } = require('./websocket');

const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problemRoutes");
const usersRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


// Routes

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);



const startServer = async () => {
  try {
    await connectDB();

    app.get("/", (req, res) => {
      res.send("Backend running");
    });

    const PORT = process.env.PORT || 5000;
    // Create HTTP server
    const server = createServer(app);
    // Setup WebSocket on the same server
    setupWebSocketServer(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server is ready`);
    })

    // const server = app.listen(PORT, () => {
    //   console.log(`Server running on port ${PORT}`);
    // });

    process.on('unhandledRejection', (err) => {
      console.log('Unhandled Rejection: ', err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
module.exports = app;
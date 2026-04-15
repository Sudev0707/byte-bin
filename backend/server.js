require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
const connectDB = require("./config/db");

const { createServer } = require('http');
const { setupWebSocketServer } = require('./websocket');

const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problemRoutes");
const usersRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");
require('./strategies/google.strategy');
require('./strategies/github.strategy');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
})); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await mongoose.model('User').findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


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
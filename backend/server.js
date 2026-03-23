require('dotenv').config();
const express = require("express");
const cors = require("cors");

// Database connection
const connectDB = require("./config/db");

// Routes
const addProblemRoutes = require("./routes/addProblemRoute");
const getProblemRoutes = require("./routes/getProblemRoute");
const deleteProblemRoute = require("./routes/deleteProblemRoute");
const editProblemRoutes = require("./routes/editProblemRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const usersRoutes = require("./routes/users");

const startServer = async () => {
  try {
    await connectDB();
    // Routes
    app.use("/api/problems", addProblemRoutes); //post
    app.use("/api/problems", getProblemRoutes); // get
    app.use("/api/problems", deleteProblemRoute); // delete
    app.use("/api/problems", editProblemRoutes); // put
    app.use("/api/users", usersRoutes);

    app.get("/", (req, res) => {
      res.send("Backend running");
    });

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

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

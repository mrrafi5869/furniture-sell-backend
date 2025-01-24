const express = require("express");
const mongoose = require("mongoose");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./src/config/connectDB");
const helmet = require("helmet");
const errorHandler = require("./src/middleware/errorHandler");
require("dotenv").config();

// Constants
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();
const http = require("http");
const bodyParser = require("body-parser");

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS.split(","),
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to the database
connectDB();
colors.enable();

// Socket.io setup
const server = http.createServer(app);

process.on('warning', (warning) => {
  console.error(warning.stack);
});


// Routes
app.get("/", (req, res) => {
  res.send(
    "<h2 style='color:green;box-sizing:border-box; margin:0; background: #f3f3f9; height: 95vh;'>Server is Running!<h2>"
  );
});


app.use("/api/v1", require("./src/routes"));

// Error handling middleware
app.use(errorHandler);

// MongoDB connection and server start
mongoose.connection.once("open", () => {
  console.log(
    colors.green.underline(`📗Connected`),
    colors.yellow.underline("to Server!")
  );
  server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(colors.red("📕", err));
});

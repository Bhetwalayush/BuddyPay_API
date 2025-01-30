
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Initialize dotenv to use environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/user', require('./routes/userRoutes'));

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to BuddyPay API");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

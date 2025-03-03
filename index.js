const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


// Initialize dotenv to use environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.options("*", cors());

// Middleware to parse JSON requests
app.use(express.json());

const adminRoutes = require('./routes/adminRoutes'); // Import adminRoutes

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/recharge', require('./routes/rechargeRoutes'));
app.use('/api/statements', require('./routes/statementRoutes'));
app.use('/uploads', express.static('public/uploads'));

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to BuddyPay API");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

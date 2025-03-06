const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const express = require('express');
const path = require('path');
const router = express.Router();
const upload = require("../middleware/uploads").default; 
const userControllers = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); 

// Route for fetching all users (admin-only access)
router.get('/', async (req, res) => {
    console.log("Get User API hit");
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return data for admins
        const allUsers = await User.find();
        res.status(200).json({ users: allUsers });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create a new user
router.post('/create', userControllers.createUser);

// Login a user
router.post('/login', userControllers.loginUser);

// Upload an image for a user
router.post("/uploads", upload, userControllers.uploadImage);

router.post('/update-fingerprint/:userId', userControllers.updateFingerprint);

router.post('/sendcredit', userControllers.sendcredit);
router.get('/senduserdetail', userControllers.sendUserDetail);

// Add route for getting the user's balance (assuming JWT authentication is required)
router.get('/balance', async (req, res) => {
    console.log("Get Balance API hit")
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, balance: user.balance });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

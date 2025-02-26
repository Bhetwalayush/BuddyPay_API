const express = require('express');
const User = require('../models/userModels');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Admin Route to Fetch Admin Data
router.get('/', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isAdmin) {
      // Return admin data, e.g., a list of all users
      const users = await User.find({});
      return res.status(200).json({ isAdmin: true, users });
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

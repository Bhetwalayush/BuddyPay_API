const User = require("../models/User"); // Import your User model

const getAdminData = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    const userCount = users.filter(user => !user.isAdmin).length; // Count non-admin users

    res.json({
      isAdmin: req.user.isAdmin,
      users,
      totalUsers: userCount, // Send total users count
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
    getAdminData,
};
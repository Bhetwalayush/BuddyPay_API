const mongoose = require("mongoose");
const Statement = require('../models/statementModel');
const asyncHandler = require("../middleware/async");

// Function to create a new statement
const createStatement = asyncHandler(async (req, res) => {
    let { amount, statement, to, userId } = req.body;
  
    // Log the received data
    console.log("Received Request for Statement:", req.body);
  
    // Check if all required fields are provided
    if (!amount || !statement || !to || !userId) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({
        success: false,
        message: "All fields (amount, statement, to, and userId) are required!"
      });
    }
  
    try {
      // Ensure userId is in ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid User ID:", userId);
        return res.status(400).json({
          success: false,
          message: "Invalid User ID format!"
        });
      }
  
      // Convert userId to ObjectId
      userId = new mongoose.Types.ObjectId(userId);
  
      // Create a new statement
      const newStatement = new Statement({
        userId,
        amount,
        statement,
        to
      });
  
      // Save the statement
      await newStatement.save();
  
      res.status(201).json({
        success: true,
        message: "Statement created successfully!",
        statement: newStatement
      });
  
    } catch (error) {
      console.error("Error creating statement:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error!"
      });
    }
  });
  

// Function to get all statements for a user
const getStatements = asyncHandler(async (req, res) => {
  console.log("Get Statement API hit");
    const { userId } = req.params; // Get userId from the request URL
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!"
      });
    }
  
    try {
      // Ensure userId is in a valid ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID format!"
        });
      }
  
      // Fetch statements for the provided userId, sorted by date
      const statements = await Statement.find({ userId }).sort({ createdAt: -1 });
  
      // If no statements found, return an empty array
      res.status(200).json({
        success: true,
        statements: statements.length > 0 ? statements : []
      });
    } catch (error) {
      console.error("Error fetching statements:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error!"
      });
    }
  });
  

module.exports = {
  createStatement,
  getStatements
};

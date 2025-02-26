const Recharge = require("../models/recharge");
const User = require("../models/userModels");

// Function to generate a 14-digit recharge code
const generateRechargeCode = (amount) => {
    const prefix = amount === "E-100" ? "E100" : amount === "E-500" ? "E500" : "E1000";
  const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(14 - prefix.length, "0");
  return prefix + randomDigits;
};

// Controller function to generate and save a recharge code
const createRechargeCode = async (req, res) => {
    const { amount } = req.body; // This is the selected option (E-100, E-500, E-1000)

  // Assign balance based on the selected option
  let balance;
  if (amount === "E-100") {
    balance = 100;
  } else if (amount === "E-500") {
    balance = 500;
  } else if (amount === "E-1000") {
    balance = 1000;
  } else {
    return res.status(400).json({ message: "Invalid amount selected." });
  }
  try {
    // Generate recharge code
    const code = generateRechargeCode();

    // Check if the code already exists in the database
    const existingCode = await Recharge.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ message: "Recharge code already exists." });
    }

   // Create a new recharge document
   const newRecharge = new Recharge({
    balance: balance,
    code: code,
    valid: true, // By default, the recharge code is valid
  });

    await newRecharge.save();

    res.status(201).json({ message: "Recharge code generated successfully.", code: newRecharge.code });
  } catch (error) {
    console.error("Error generating recharge code:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Controller function to validate a recharge code
const validateRechargeCode = async (req, res) => {
  const { code, userId } = req.body; // Add userId to the request body (you can pass this with the request)
  
  try {
    // Check if the recharge code exists
    const recharge = await Recharge.findOne({ code });

    if (!recharge) {
      return res.status(404).json({ message: "Recharge code not found." });
    }

    // Check if the code is valid
    if (!recharge.valid) {
      return res.status(400).json({ message: "Recharge code has already been used." });
    }

    // Find the user by ID
    const user = await User.findById(userId); // Assuming you have a user model and it's stored by ID

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add the recharge amount to the user's balance
    user.balance += recharge.balance;

    // Save the updated user
    await user.save();

    // Mark the code as used (invalid)
    recharge.valid = false;
    await recharge.save();
    console.log("Recharge API hit");

    res.status(200).json({ message: "Recharge code validated and balance updated successfully.",
      amount: recharge.balance, 
     });
  } catch (error) {
    console.error("Error validating recharge code:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllRecharges = async (req, res) => {
    try {
      const recharges = await Recharge.find(); // Get all recharge documents from the database
      res.status(200).json({ recharges });
    } catch (error) {
      console.error("Error fetching recharge codes:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

module.exports = { createRechargeCode, validateRechargeCode, getAllRecharges };

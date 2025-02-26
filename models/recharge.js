const mongoose = require("mongoose");

const rechargeSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      required: true
  },
    code: {
      type: String,
      required: true,
      unique: true, // Ensure the code is unique
    },
    valid: {
      type: Boolean,
      default: true, // Default to true, meaning the code is valid when generated
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

const Recharge = mongoose.model("Recharge", rechargeSchema);

module.exports = Recharge;

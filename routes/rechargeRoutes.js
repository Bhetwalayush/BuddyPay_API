const express = require("express");
const { createRechargeCode, validateRechargeCode, getAllRecharges } = require("../controllers/rechargeController");

const router = express.Router();

// Route to generate a recharge code
router.post("/generate", createRechargeCode);

// Route to validate a recharge code
router.post("/validate", validateRechargeCode);


// Route for fetching all recharge codes (for statements)
router.get("/all", getAllRecharges);


module.exports = router;

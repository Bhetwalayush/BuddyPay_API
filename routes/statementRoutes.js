const express = require('express');
const router = express.Router();
const statementControllers = require('../controllers/statementController');
const { protect } = require("../middleware/auth"); // Ensure only authenticated users can access

// Route to create a statement
router.post('/createStatement',statementControllers.createStatement);

// Route to get all statements for the logged-in user
router.get('/:userId', statementControllers.getStatements); 

module.exports = router;

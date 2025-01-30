
// const nodemailer = require('nodemailer');
const User = require('../models/userModels');
const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploads").default; 
const userControllers = require('../controllers/userController');
// Make a create user API
router.post('/create', userControllers.createUser);

// Login user API
router.post('/login', userControllers.loginUser)
router.post("/uploadImage", upload, userControllers.uploadImage);  


module.exports = router;
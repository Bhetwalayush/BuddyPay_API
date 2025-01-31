const STATIC_SALT = process.env.SALT_SECRET || "default_salt";
const userModel = require('../models/userModels');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require("../middleware/async");

// Function to generate hashed password
function generatePassword(password) {
    const genHash = crypto.pbkdf2Sync(password, STATIC_SALT, 10000, 64, 'sha512').toString('hex');
    return { hash: genHash };
}

// Function to validate password
function validPassword(password, hash) {
    const checkHash = crypto.pbkdf2Sync(password, STATIC_SALT, 10000, 64, 'sha512').toString('hex');
    return hash === checkHash;
}


const createUser = async (req, res) => {
    console.log("Create user API hit");
    const { fullname, phone, image,password,pin,device } = req.body;

    // Validation
    if (!fullname || !phone || !password ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

    // if (password !== confirmPassword) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Passwords do not match!"
    //     });
    // }

    try {
        // Check if the user already exists
        const existingUser = await userModel.findOne({ phone: phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists!"
            });
        }

        // Generate hashed password
        const { hash } = generatePassword(password);
            const newUser = new userModel({
            fullname,
            phone,
            image,
            password: hash,  
            pin,
            device
        });


        await newUser.save();

        // Send the success response
        res.status(201).json({
            success: true,
            message: "User created successfully!"
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

const loginUser = async (req, res) => {
    console.log("Login user API hit");
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Phone number and password are required!"
        });
    }

    try {
        const user = await userModel.findOne({ phone: phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        if (!validPassword(password, user.password)) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password!"
            });
        }

        // Ensure JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env file");
            return res.status(500).json({
                success: false,
                message: "JWT secret not found!"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, is_admin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }  // Set token expiration
        );

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            userData: { id: user._id, fullname: user.fullname, phone: user.phone }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};
const uploadImage = asyncHandler(async (req, res, next) => {
    console.log("🔥 File Received:", req.file);

    if (!req.file) {
        return res.status(400).json({ message: "Please upload a file" });
    }
    res.status(200).json({
        success: true,
        data: req.file.filename,
      });
});
const sendTokenResponse = (userModel, statusCode, res) => {
    const token = userModel.getSignedJwtToken();
  
    const options = {
      //Cookie will expire in 30 days
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    // Cookie security is false .if you want https then use this code. do not use in development time
    if (process.env.NODE_ENV === "proc") {
      options.secure = true;
    }
    //we have created a cookie with a token
  
    res
      .status(statusCode)
      .cookie("token", token, options) // key , value ,options
      .json({
        success: true,
        token,
      });

    };

module.exports = {
    createUser,
    loginUser,
    uploadImage
};
const STATIC_SALT = process.env.SALT_SECRET || "default_salt";
const userModel = require('../models/userModels');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require("../middleware/async");
const sendEmail = require("../middleware/emailService");

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
    const { fullname, phone, image, password, pin, device,email } = req.body;

    // Validation
    if (!fullname || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

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
            device,
            email,
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, is_admin: newUser.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }  // Token expiration
        );

        // Send the success response
        res.status(201).json({
            success: true,
            message: "User created successfully!",
            token: token,
            userData: { id: newUser._id, fullname: newUser.fullname, phone: newUser.phone }
        });

         // ✅ Send registration confirmation email
        const emailSubject = "Account Created Successfully";
        const emailText = `Hello ${fullname},\n\nYour account has been successfully created.\n\nThank you for registering!`;
        await sendEmail(email, emailSubject, emailText);

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
            userData: {
                id: user._id,
                fullname: user.fullname,
                phone: user.phone,
                balance: user.balance,
                image: user.image,
                isAdmin: user.isAdmin, 
            },
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

    const user = await userModel.findById(req.user.id);  // Ensure `req.user` is set
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.image = req.file.filename;
    await user.save();

    res.status(200).json({
        success: true,
        data: req.file.filename,
      });
});
const sendcredit = async (req, res) => {
    console.log("Send credit API hit");
    const { senderId, recipientNumber, amount } = req.body; // Accept senderId along with recipient number and amount from the request body

    if (!senderId || !recipientNumber || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid sender ID, recipient number or amount!"
        });
    }

    try {
        const sender = await userModel.findById(senderId);
        if (!sender) {
            return res.status(404).json({
                success: false,
                message: "Sender not found!"
            });
        }

        // Ensure the sender has enough balance
        if (sender.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance!"
            });
        }

        // Find recipient by phone number
        const recipient = await userModel.findOne({ phone: recipientNumber });
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found!"
            });
        }
        

        // Deduct the amount from the sender's balance
        sender.balance -= amount;
        await sender.save();

        // Convert amount to a number to prevent string concatenation
        const transferAmount = Number(amount);

        // Add the amount to the recipient's balance
        recipient.balance += transferAmount;
        await recipient.save();

        // Optional: Create a transaction statement (if needed)
        // You can also log the transaction in a 'statements' collection or something similar

        res.status(200).json({
            success: true,
            message: `Successfully sent Rs ${amount} to ${recipient.fullname}.`
        });
    } catch (error) {
        console.error("Error sending credits:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

const updateFingerprint = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fingerprint } = req.body;

        if (!fingerprint) {
            return res.status(400).json({ message: "Fingerprint data is required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.fingerprint = fingerprint;
        await user.save();

        res.status(200).json({ message: "Fingerprint updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

  const getUserBalance = async (req, res) => {
    const userId = req.user._id; // Retrieve user ID from authenticated user (you should have a middleware to ensure the user is authenticated)
    
    try {
        // Find the user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }
        
        // Send the balance data in response
        res.status(200).json({
            success: true,
            balance: user.balance
        });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};
const sendUserDetail = async (req, res) => {
    console.log("Send user detail API hit");
    const userId = req.user._id;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullname: user.fullname,
                phone: user.phone,
                image: user.image,
                balance: user.balance,
                isAdmin: user.isAdmin,
                device: user.device,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ success: false, message: "Internal server error!" });
    }
};


module.exports = {
    createUser,
    loginUser,
    uploadImage,
    sendcredit,
    getUserBalance,
    sendUserDetail,
    updateFingerprint
};
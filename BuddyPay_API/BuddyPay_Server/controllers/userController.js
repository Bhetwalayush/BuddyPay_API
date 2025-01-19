
const userModel = require('../models/userModels');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Function to generate hashed password
function generatePassword(password) {
    const confirm = crypto.randomBytes(32).toString('hex');
    const pin = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, confirm, 10000, 64, 'sha512').toString('hex');
    return {
        confirm: confirm,
        pin: pin,
        hash: genHash
    };
}

// Function to validate password
function validPassword(password, hash, confirm) {
    const checkHash = crypto.pbkdf2Sync(password, confirm, 10000, 64, 'sha512').toString('hex');
    return hash === checkHash;
}

const createUser = async (req, res) => {
    console.log("Create user API hit");
    const { fullname, phone, password,pin,device } = req.body;

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
        const { confirm, hash } = generatePassword(password);

        // Save the user in the database
        const newUser = new userModel({
            fullname: fullname,
            phone: phone,
            password: hash,
            // confirm: confirm,
            pin: pin,
            device: device,
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

    // Validation
    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Number and password are required!"
        });
    }

    try {
        // Find user by phone
        const user = await userModel.findOne({ phone: phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        // Validate the password
        try {
            if (!validPassword(password, user.password, user.confirm)) {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect password!"
                });
            }
        } catch (passwordError) {
            console.error("Error validating password:", passwordError);
            return res.status(500).json({
                success: false,
                message: "Password validation failed!"
            });
        }

        // Generate JWT token
        try {
            const token = jwt.sign(
                { id: user._id, is_admin: user.isAdmin },
                process.env.JWT_SECRET,
            );

            res.status(200).json({
                success: true,
                message: "Login successful!",
                token: token,
                userData: { id: user._id, fullname: user.fullname, phone: user.phone }
            });
        } catch (tokenError) {
            console.error("Error generating JWT:", tokenError);
            return res.status(500).json({
                success: false,
                message: "JWT generation failed!"
            });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

module.exports = {
    createUser,
    loginUser
};
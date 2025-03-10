const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const User = require('../models/userModels');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(" ")[1];
    }
  
    //Make sure token exist
    if (!token) {
      // return next(new ErrorResponse('Not authorized to access this route', 401));
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }
  
    try {
      //Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded);
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      // return next(new ErrorResponse('Not authorized to access this route', 401));
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }
  });
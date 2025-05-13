import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// Protect Routes Middleware
const protect =  asyncHandler(async (req, res, next) => {
    let token;
  try {
     // Check for the token in the authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
      } catch (error) {
        return res.status(400).json({ message: 'Malformed authorization header' });
      }
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }; // Type assertion
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(401).json({
      message:
        error.name === 'TokenExpiredError'
          ? 'Session expired'
          : 'Invalid token',
    });
  }
});
// Admin Middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized, as admin");
  }
};

export { protect, admin };

import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// Protect Routes Middleware
const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // DEBUG: log incoming cookies and headers
  console.log("Cookies:", req.cookies);
  console.log("Authorization:", req.headers.authorization);

  // Try to get token from cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Fallback: Try to get token from Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(401);
    throw new Error("Not authorized, token failed");
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

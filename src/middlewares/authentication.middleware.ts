// src/middleware/isValidUser.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../model/user.model";
import { Types } from "mongoose";

// JWT payload interface
interface JwtPayload {
  email: string;
  [key: string]: any; // Allow additional properties
}

// Structure of user data attached to request
interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

// Extended Request type with user property
interface AuthRequest extends Request {
  user?: AuthUser;
}

const isValidUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Bearer token
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET as string;

  try {
    // 2. Verify JWT token
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    // 3. Find user in database
    const user = await User.findOne({ email: decoded.email })
      .select("_id email role")
      .lean()
      .exec();

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 4. Attach user to request
    req.user = {
      id: user._id.toString(), // Convert ObjectId to string
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // Handle different error cases
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

export default isValidUser;

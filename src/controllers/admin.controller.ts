import express from "express";
import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../model/user.model";
import isValidUser from "../middlewares/authentication.middleware";
import authorize from "../middlewares/authorization.middleware";
import logger from "../loggers/winston.logger";

const adminRouter = express.Router();

// Interface for User type (adjust according to your User model)
interface IUser {
  _id: mongoose.Types.ObjectId;
  role: string;
  // Add other user properties as needed
}

// Admin-only route
adminRouter.get(
  "/admin/dashboard",
  isValidUser,
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      // Fetch all users, excluding passwords
      const users = await User.find({ role: "user" }).select("-password");

      res.status(200).json({
        message: "All user details fetched successfully.",
        totalUsers: users.length,
        users,
      });
    } catch (err) {
      logger.error(`Error fetching users: ${err}`);
      res.status(500).json({
        message: "Server error while fetching user details.",
      });
    }
  }
);

// Admin can delete a user by ID
adminRouter.delete(
  "/admin/deleteUser/:id",
  isValidUser,
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;

      if (!mongoose.isValidObjectId(userId)) {
        logger.error(`Invalid MongoDB ID: ${userId}`);
        return res.status(400).json({ message: "Invalid Mongo Id" });
      }

      const result = await User.deleteOne({ _id: userId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User successfully deleted",
      });
    } catch (err) {
      logger.error(`Error deleting user: ${err}`);
      res.status(500).json({
        message: "Server error while deleting user",
      });
    }
  }
);

export default adminRouter;

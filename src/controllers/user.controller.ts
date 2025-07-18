import express from "express";
import { Request, Response } from "express";
import User from "../model/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  registerSchema,
  loginSchema,
  editUserSchema,
} from "../schema/validationSchema";
import isValidUser from "../middlewares/authentication.middleware";
import authorize from "../middlewares/authorization.middleware";
import upload from "../middlewares/imageUpload.middleware";
import uploadFile from "../middlewares/pdfUpload.middleware";
import uploadCoverPhoto from "../middlewares/coverPhoto.middleware";
import multer from "multer";
import { z } from "zod";
import fs from "fs";
import cloudinary from "../cloudinary/cloudinary";

const userRouter = express.Router();

userRouter.post("/user/register", async (req: Request, res: Response) => {
  try {
    const newUser = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await User.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashedPassword;

    // Create user
    await User.create(newUser);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/user/login", async (req: Request, res: Response) => {
  try {
    // Validate and parse request body
    const loginCredentials = loginSchema.parse(req.body);
    const { email, password } = loginCredentials;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Create token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET as string // Consider moving this to an environment variable
    );

    return res.status(200).send({ user, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

type EditUserInput = z.infer<typeof editUserSchema>;

userRouter.put(
  "/user/edit/:id",
  isValidUser,
  upload.single("profile_pic"),
  async (req: Request, res: Response) => {
    try {
      // Disallow updating email and role
      if ("email" in req.body) delete req.body.email;
      if ("role" in req.body) delete req.body.role;

      const updates: Partial<EditUserInput> & { profile_pic?: string | null } =
        {};

      // Handle profile picture upload
      if (req.file) {
        updates.profile_pic = `${req.protocol}://${req.get("host")}/uploads/${
          req.file.filename
        }`;
      } else if (req.body.profile_pic === "" || req.body.profile_pic === null) {
        updates.profile_pic = null;
      }

      // Parse address if provided
      if (req.body.address) {
        try {
          updates.address =
            typeof req.body.address === "string"
              ? JSON.parse(req.body.address)
              : req.body.address;
        } catch (error: any) {
          return res.status(400).json({
            message: "Invalid address format",
            error: error.message,
          });
        }
      }

      // Add other fields
      if (req.body.name) updates.name = req.body.name;
      if (req.body.password) updates.password = req.body.password;

      // Validate with Zod
      const validatedData = editUserSchema.parse({
        ...updates,
        profile_pic: updates.profile_pic, // Must match schema key
      });

      // Sync profile_pic
      if ("profile_pic" in validatedData) {
        updates.profile_pic = validatedData.profile_pic;
      }

      // Hash password if present
      if (validatedData.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(validatedData.password, salt);
      }

      console.log("Validated updates:", validatedData);
      console.log("Final updates to DB:", updates);

      // Perform DB update
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password using destructuring
      const { password, ...userToReturn } = updatedUser.toObject();

      res.status(200).json({
        message: "User updated successfully",
        user: userToReturn,
      });
    } catch (error: any) {
      console.error("Update error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      res.status(400).json({
        message: "Failed to update user",
        error: error.message,
      });
    }
  }
);

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

userRouter.put(
  "/user/uploadCV/:id",
  isValidUser,
  (req: Request, res: Response) => {
    uploadFile.array("pdf", 2)(req, res, async (err: any) => {
      const reqWithFiles = req as MulterRequest;

      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!reqWithFiles.files || reqWithFiles.files.length === 0) {
        return res.status(400).json({ message: "No CV files uploaded" });
      }

      try {
        const pdfUrls = reqWithFiles.files.map(
          (file) =>
            `${req.protocol}://${req.get("host")}/files/${file.filename}`
        );

        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          { $set: { pdf: pdfUrls } },
          { new: true }
        );

        if (!updatedUser) {
          // Clean up uploaded files if user not found
          for (const file of reqWithFiles.files) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkErr) {
              console.error("Error deleting file:", unlinkErr);
            }
          }
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
          message: "CV uploaded successfully",
          pdfUrl: pdfUrls,
          user: updatedUser,
        });
      } catch (error: any) {
        // Clean up uploaded files on error
        if (reqWithFiles.files) {
          for (const file of reqWithFiles.files) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkErr) {
              console.error("Error deleting file:", unlinkErr);
            }
          }
        }
        res
          .status(500)
          .json({ message: "Failed to update user", error: error.message });
      }
    });
  }
);

userRouter.put(
  "/user/uploadCover/:id",
  isValidUser,
  (req: Request, res: Response) => {
    uploadCoverPhoto.single("coverPhoto")(req, res, async (err: any) => {
      if (err) return res.status(400).json({ message: err.message });
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      try {
        const coverPhotoUrl: string = req.file.path;
        const coverPhotoId: string = req.file.filename;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.cover_photo_id) {
          await cloudinary.uploader.destroy(user.cover_photo_id);
        }

        user.cover_photo = coverPhotoUrl;
        user.cover_photo_id = coverPhotoId;
        await user.save();

        res.status(200).json({
          message: "Cover photo uploaded successfully",
          coverPhoto: coverPhotoUrl,
          user,
        });
      } catch (error: any) {
        res
          .status(500)
          .json({ message: "Upload failed", error: error.message });
      }
    });
  }
);

export default userRouter;

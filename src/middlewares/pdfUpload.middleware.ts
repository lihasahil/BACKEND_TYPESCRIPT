import multer from "multer";
import { Request } from "express";

// 1. Fix the diskStorage import by using multer.diskStorage directly
const storage = multer.diskStorage({
  destination: "files",
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 2. Properly type the file filter callback
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["application/pdf", "application/octet-stream"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // 3. Create proper Error instance
    cb(new Error("Only PDF files are allowed"));
  }
};

// 4. Export the configured multer instance
const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default uploadFile;

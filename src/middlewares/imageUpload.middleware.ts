import multer, { diskStorage } from "multer";
import { Request } from "express";

// Define the file type for better type safety
interface MulterFile extends Express.Multer.File {
  originalname: string;
}

const storage = diskStorage({
  destination: "uploads",
  filename: (
    req: Request,
    file: MulterFile,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
});

export default upload;

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "cover_photos",
    public_id: `cover_${Date.now()}`,
    format: "jpg", // optional
    transformation: [{ width: 1200, height: 628, crop: "fill" }],
  }),
});

const uploadCoverPhoto = multer({ storage });

export default uploadCoverPhoto;

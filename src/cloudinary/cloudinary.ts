import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dtscnwjmn",
  api_key: process.env.CLOUDINARY_API_KEY || "997171465615495",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "Ug02survSSOAA53YLQop5J6XaqE",
});

export default cloudinary;

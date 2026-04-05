import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const isCloudinaryConfigured =
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_KEY &&
  process.env.CLOUDINARY_SECRET;
let upload;
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "smartcert/documents", 
      resource_type: "auto", 
      public_id: (req, file) => {
        return `${Date.now()}-${file.originalname.split(".")[0]}`;
      },
    },
  });
  upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024, 
    },
  });
} else {
  console.warn("⚠️  Cloudinary not configured. Using local disk storage.");
  console.warn(
    "Set CLOUDINARY_NAME, CLOUDINARY_KEY, and CLOUDINARY_SECRET in .env to use Cloudinary.\n",
  );
  const uploadDir = "uploads/";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024, 
    },
  });
}
export default upload;

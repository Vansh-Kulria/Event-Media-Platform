import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (filePath: string): Promise<string | null> => {
  if (!isCloudinaryConfigured) {
    return null;
  }
  try {
    const filename = path.basename(filePath, path.extname(filePath));
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "event-media-platform",
      resource_type: "auto",
      public_id: filename,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

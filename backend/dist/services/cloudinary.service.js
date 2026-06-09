"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = exports.isCloudinaryConfigured = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (exports.isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const uploadToCloudinary = async (filePath) => {
    if (!exports.isCloudinaryConfigured) {
        return null;
    }
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder: "event-media-platform",
            resource_type: "auto",
        });
        return result.secure_url;
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
};
exports.uploadToCloudinary = uploadToCloudinary;

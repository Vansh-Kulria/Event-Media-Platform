"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingPhotos = exports.ensureLocalFile = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const ensureLocalFile = async (urlOrPath) => {
    const uploadsDir = path_1.default.join(__dirname, "../../uploads");
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!urlOrPath.startsWith("http")) {
        const filename = path_1.default.basename(urlOrPath);
        return `uploads/${filename}`;
    }
    const cleanUrl = urlOrPath.split("?")[0];
    const filename = path_1.default.basename(cleanUrl);
    const localPath = path_1.default.join(uploadsDir, filename);
    if (fs_1.default.existsSync(localPath)) {
        return `uploads/${filename}`;
    }
    console.log(`Downloading remote file for local caching: ${cleanUrl} -> ${localPath}`);
    const response = await fetch(cleanUrl);
    if (!response.ok) {
        throw new Error(`Failed to download remote file from ${cleanUrl}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs_1.default.writeFileSync(localPath, buffer);
    return `uploads/${filename}`;
};
exports.ensureLocalFile = ensureLocalFile;
const findMatchingPhotos = async (selfiePath) => {
    try {
        const localSelfie = await (0, exports.ensureLocalFile)(selfiePath);
        // Fetch all image media records to local disk
        const mediaItems = await prisma_1.default.media.findMany({
            where: {
                type: "IMAGE",
            },
        });
        console.log(`Found ${mediaItems.length} image media records. Ensuring they are cached locally...`);
        // Sync all images in parallel
        await Promise.all(mediaItems.map((item) => (0, exports.ensureLocalFile)(item.url).catch((err) => console.error(`Failed to cache media item ${item.id}:`, err))));
        const scriptPath = path_1.default.join(__dirname, "../../python/face_match.py");
        const uploadsPath = path_1.default.join(__dirname, "../../uploads");
        const absoluteSelfiePath = path_1.default.isAbsolute(localSelfie)
            ? localSelfie
            : path_1.default.resolve(path_1.default.join(__dirname, "../../", localSelfie));
        console.log(`Executing DeepFace matching with selfie ${absoluteSelfiePath} and database ${uploadsPath}...`);
        const { stdout } = await execAsync(`python "${scriptPath}" "${absoluteSelfiePath}" "${uploadsPath}"`);
        const lines = stdout.trim().split(/\r?\n/);
        const jsonLine = lines.find(line => line.trim().startsWith("[") && line.trim().endsWith("]"));
        if (!jsonLine) {
            console.error("No JSON array found in face matching output:", stdout);
            return [];
        }
        return JSON.parse(jsonLine.trim());
    }
    catch (err) {
        console.error("DeepFace Python execution failed, returning no matches:", err);
        return [];
    }
};
exports.findMatchingPhotos = findMatchingPhotos;

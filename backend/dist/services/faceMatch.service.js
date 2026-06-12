"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingPhotos = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const findMatchingPhotos = async (selfiePath) => {
    try {
        const scriptPath = path_1.default.join(__dirname, "../../python/face_match.py");
        const uploadsPath = path_1.default.join(__dirname, "../../uploads");
        const absoluteSelfiePath = path_1.default.isAbsolute(selfiePath)
            ? selfiePath
            : path_1.default.resolve(path_1.default.join(__dirname, "../../", selfiePath));
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingPhotos = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const findMatchingPhotos = async (selfiePath) => {
    try {
        const { stdout } = await execAsync(`python python/face_match.py "${selfiePath}" uploads`);
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

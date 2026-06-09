"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingPhotos = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const findMatchingPhotos = async (selfiePath) => {
    try {
        const { stdout } = await execAsync(`python python/face_match.py "${selfiePath}" uploads`);
        return JSON.parse(stdout.trim());
    }
    catch (err) {
        console.error("DeepFace Python execution failed, returning no matches:", err);
        return [];
    }
};
exports.findMatchingPhotos = findMatchingPhotos;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os_1.default.tmpdir());
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);
        cb(null, uniqueName +
            path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
});
exports.default = upload;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTags = void 0;
const path_1 = __importDefault(require("path"));
const generateTags = async (filePath) => {
    const filename = path_1.default.basename(filePath).toLowerCase();
    const tagMapping = {
        mountain: ["mountains", "nature", "landscape", "outdoor"],
        hill: ["mountains", "nature", "landscape", "outdoor"],
        beach: ["beach", "sea", "ocean", "nature", "outdoor", "sand"],
        sea: ["beach", "sea", "ocean", "nature"],
        ocean: ["beach", "sea", "ocean", "nature"],
        sport: ["sports", "action", "athletic", "game"],
        run: ["sports", "action", "athletic"],
        play: ["sports", "game"],
        crowd: ["crowd", "people", "gathering", "event"],
        people: ["people", "candid", "social"],
        party: ["party", "celebration", "event", "gathering"],
        music: ["music", "concert", "stage", "performance", "event"],
        concert: ["music", "concert", "stage", "performance", "event"],
        fest: ["festival", "event", "celebration", "crowd"],
        food: ["food", "dining", "culinary"],
        nature: ["nature", "outdoor", "landscape"],
        forest: ["forest", "trees", "nature", "outdoor"],
        tree: ["trees", "nature", "outdoor"],
    };
    for (const [keyword, tags] of Object.entries(tagMapping)) {
        if (filename.includes(keyword)) {
            return tags;
        }
    }
    const combinations = [
        ["event", "gathering", "people", "celebration"],
        ["portrait", "candid", "people", "indoor"],
        ["landscape", "outdoor", "nature", "scenery"],
        ["action", "event", "sports", "crowd"],
        ["concert", "stage", "performance", "music"],
        ["group", "people", "friends", "smile"],
    ];
    const randomIndex = Math.floor(Math.random() * combinations.length);
    return combinations[randomIndex];
};
exports.generateTags = generateTags;

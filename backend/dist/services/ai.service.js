"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTags = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const generateTags = async (filePath, originalName, eventTitle, eventDescription, eventCategory) => {
    const allTagsSet = new Set();
    // 1. Run AI Tagging from Python script
    let aiTags = [];
    try {
        const { stdout } = await execAsync(`python python/tag_image.py "${filePath}"`);
        const lines = stdout.trim().split(/\r?\n/);
        const jsonLine = lines.find(line => line.trim().startsWith("[") && line.trim().endsWith("]"));
        if (jsonLine) {
            aiTags = JSON.parse(jsonLine.trim());
        }
    }
    catch (err) {
        console.error("AI image tagging execution failed, using fallback:", err);
    }
    aiTags.forEach(t => allTagsSet.add(t.toLowerCase()));
    // 2. Keyword Mapping Logic from Filename and Event Metadata
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
        wedding: ["wedding", "celebration", "formal", "people"],
        marriage: ["wedding", "celebration", "formal", "people"],
        groom: ["wedding", "celebration", "formal", "people"],
        bride: ["wedding", "celebration", "formal", "people"],
        birthday: ["birthday", "party", "celebration", "gathering"],
        bday: ["birthday", "party", "celebration", "gathering"],
        cake: ["birthday", "party", "celebration"],
        conference: ["conference", "business", "gathering"],
        meetup: ["gathering", "social"],
        talk: ["conference", "learning"],
        seminar: ["conference", "learning"],
        grad: ["graduation", "celebration", "formal"],
        travel: ["travel", "outdoor"],
        trip: ["travel", "outdoor"],
        tour: ["travel"],
        selfie: ["selfie", "portrait", "people"],
        cat: ["animals", "pets"],
        dog: ["animals", "pets"],
        pet: ["animals", "pets"],
        drink: ["drinks", "party"],
        wine: ["drinks", "party"],
        beer: ["drinks", "party"],
    };
    const textToScan = [
        originalName || "",
        eventTitle || "",
        eventDescription || "",
        eventCategory || ""
    ].join(" ").toLowerCase();
    for (const [keyword, tags] of Object.entries(tagMapping)) {
        if (textToScan.includes(keyword)) {
            tags.forEach(t => allTagsSet.add(t.toLowerCase()));
        }
    }
    // Also include the event category directly if present
    if (eventCategory) {
        allTagsSet.add(eventCategory.toLowerCase());
    }
    // 3. Fallback tags if set is empty
    if (allTagsSet.size === 0) {
        allTagsSet.add("photo");
        allTagsSet.add("event");
    }
    return Array.from(allTagsSet);
};
exports.generateTags = generateTags;

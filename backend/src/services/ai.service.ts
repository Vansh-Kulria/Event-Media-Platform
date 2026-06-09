import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const generateTags = async (
  filePath: string
): Promise<string[]> => {
  let aiTags: string[] = [];
  try {
    const { stdout } = await execAsync(
      `python python/tag_image.py "${filePath}"`
    );
    const lines = stdout.trim().split(/\r?\n/);
    const jsonLine = lines.find(line => line.trim().startsWith("[") && line.trim().endsWith("]"));
    if (jsonLine) {
      aiTags = JSON.parse(jsonLine.trim());
    }
  } catch (err) {
    console.error("AI image tagging execution failed, using fallback:", err);
  }

  const filename = path.basename(filePath).toLowerCase();

  const tagMapping: { [key: string]: string[] } = {
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

  const filenameTags: string[] = [];
  for (const [keyword, tags] of Object.entries(tagMapping)) {
    if (filename.includes(keyword)) {
      filenameTags.push(...tags);
    }
  }

  const allTagsSet = new Set<string>();
  aiTags.forEach(t => allTagsSet.add(t.toLowerCase()));
  filenameTags.forEach(t => allTagsSet.add(t.toLowerCase()));

  if (allTagsSet.size === 0) {
    allTagsSet.add("photo");
    allTagsSet.add("event");
  }

  return Array.from(allTagsSet);
};
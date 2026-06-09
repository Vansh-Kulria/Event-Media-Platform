import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const findMatchingPhotos = async (
  selfiePath: string
): Promise<string[]> => {
  try {
    const { stdout } = await execAsync(
      `python python/face_match.py "${selfiePath}" uploads`
    );
    const lines = stdout.trim().split(/\r?\n/);
    const jsonLine = lines.find(line => line.trim().startsWith("[") && line.trim().endsWith("]"));
    if (!jsonLine) {
      console.error("No JSON array found in face matching output:", stdout);
      return [];
    }
    return JSON.parse(jsonLine.trim());
  } catch (err) {
    console.error("DeepFace Python execution failed, returning no matches:", err);
    return [];
  }
};
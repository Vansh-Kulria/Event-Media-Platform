import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const findMatchingPhotos = async (
  selfiePath: string
): Promise<string[]> => {
  try {
    const scriptPath = path.join(__dirname, "../../python/face_match.py");
    const uploadsPath = path.join(__dirname, "../../uploads");
    const absoluteSelfiePath = path.isAbsolute(selfiePath)
      ? selfiePath
      : path.resolve(path.join(__dirname, "../../", selfiePath));
    const { stdout } = await execAsync(
      `python "${scriptPath}" "${absoluteSelfiePath}" "${uploadsPath}"`
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
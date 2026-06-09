import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const findMatchingPhotos = async (
  selfiePath: string
) => {
  const { stdout } = await execAsync(
    `python python/face_match.py "${selfiePath}" uploads`
  );

  return JSON.parse(stdout);
};
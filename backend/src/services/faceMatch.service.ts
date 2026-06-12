import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import prisma from "../lib/prisma";

const execAsync = promisify(exec);

export const ensureLocalFile = async (urlOrPath: string): Promise<string> => {
  const uploadsDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!urlOrPath.startsWith("http")) {
    const filename = path.basename(urlOrPath);
    return `uploads/${filename}`;
  }

  const cleanUrl = urlOrPath.split("?")[0];
  const filename = path.basename(cleanUrl);
  const localPath = path.join(uploadsDir, filename);

  if (fs.existsSync(localPath)) {
    return `uploads/${filename}`;
  }

  console.log(`Downloading remote file for local caching: ${cleanUrl} -> ${localPath}`);
  const response = await fetch(cleanUrl);
  if (!response.ok) {
    throw new Error(`Failed to download remote file from ${cleanUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(localPath, buffer);
  return `uploads/${filename}`;
};

export const findMatchingPhotos = async (
  selfiePath: string
): Promise<string[]> => {
  try {
    const localSelfie = await ensureLocalFile(selfiePath);

    // Fetch all image media records to local disk
    const mediaItems = await prisma.media.findMany({
      where: {
        type: "IMAGE",
      },
    });

    console.log(`Found ${mediaItems.length} image media records. Ensuring they are cached locally...`);
    // Sync all images in parallel
    await Promise.all(
      mediaItems.map((item) =>
        ensureLocalFile(item.url).catch((err) =>
          console.error(`Failed to cache media item ${item.id}:`, err)
        )
      )
    );

    const scriptPath = path.join(__dirname, "../../python/face_match.py");
    const uploadsPath = path.join(__dirname, "../../uploads");
    const absoluteSelfiePath = path.isAbsolute(localSelfie)
      ? localSelfie
      : path.resolve(path.join(__dirname, "../../", localSelfie));

    console.log(`Executing DeepFace matching with selfie ${absoluteSelfiePath} and database ${uploadsPath}...`);
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
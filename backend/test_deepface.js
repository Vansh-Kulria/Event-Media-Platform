require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const ensureLocalFile = async (urlOrPath) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!urlOrPath.startsWith('http')) {
    const filename = path.basename(urlOrPath);
    return `uploads/${filename}`;
  }

  const cleanUrl = urlOrPath.split('?')[0];
  const filename = path.basename(cleanUrl);
  const localPath = path.join(uploadsDir, filename);

  if (fs.existsSync(localPath)) {
    console.log(`File exists: ${filename}`);
    return `uploads/${filename}`;
  }

  console.log(`Downloading: ${cleanUrl} -> ${localPath}`);
  const response = await fetch(cleanUrl);
  if (!response.ok) {
    throw new Error(`Failed to download remote file from ${cleanUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(localPath, buffer);
  return `uploads/${filename}`;
};

async function main() {
  const user = await prisma.user.findFirst({
    where: { selfieUrl: { not: null } }
  });
  if (!user) {
    console.log("No user with selfie found.");
    return;
  }
  console.log("User:", user.name, "Selfie:", user.selfieUrl);

  const localSelfie = await ensureLocalFile(user.selfieUrl);
  console.log("Local selfie path:", localSelfie);

  const mediaItems = await prisma.media.findMany({
    where: { type: 'IMAGE' }
  });
  console.log("Media items count:", mediaItems.length);

  for (const item of mediaItems) {
    await ensureLocalFile(item.url);
  }

  const scriptPath = path.join(__dirname, 'python/face_match.py');
  const uploadsPath = path.join(__dirname, 'uploads');
  const absoluteSelfiePath = path.resolve(path.join(__dirname, localSelfie));

  console.log("Running Python script...");
  const cmd = `python "${scriptPath}" "${absoluteSelfiePath}" "${uploadsPath}"`;
  console.log("Command:", cmd);
  try {
    const { stdout, stderr } = await execAsync(cmd);
    console.log("STDOUT:", stdout);
    console.log("STDERR:", stderr);
  } catch (err) {
    console.error("Exec failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

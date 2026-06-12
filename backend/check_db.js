require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, selfieUrl: true }
  });
  console.log("Users:", users);
  const media = await prisma.media.findMany({
    select: { id: true, url: true, tags: true }
  });
  console.log("Media Count:", media.length);
  console.log("Media samples:", media.slice(0, 10));
}
main().catch(console.error).finally(() => prisma.$disconnect());

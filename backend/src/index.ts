import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { initSocket } from "./socket";
import prisma from "./lib/prisma";


const app = express();
const server = http.createServer(app);


initSocket(server);
const PORT = process.env.PORT || 5000;
import dotenv from "dotenv";
dotenv.config();
import {
  authenticate,
  AuthRequest,
} from "./middleware/auth.middleware";

import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import mediaRoutes from "./routes/media.routes";
import notificationRoutes from "./routes/notification.routes";
import analyticsRoutes from "./routes/analytics.routes";


const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const cleanFrontendUrl = rawFrontendUrl.endsWith("/") ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

app.use(
  cors({
    origin: [cleanFrontendUrl, `${cleanFrontendUrl}/`],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
});
app.get(
  "/api/profile",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          selfieUrl: true,
        },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }
);

app.get(
  "/api/users/:userId/profile",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const targetUserId = req.params.userId as string;
      const viewerId = req.user!.userId as string;

      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          selfieUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const media = await prisma.media.findMany({
        where: { uploadedById: targetUserId },
        include: {
          event: true,
          likes: true,
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          favorites: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const mediaWithState = media.map((item) => ({
        ...item,
        likedByCurrentUser: item.likes.some((l) => l.userId === viewerId),
        favoritedByCurrentUser: item.favorites.some((f) => f.userId === viewerId),
      }));

      res.json({
        user,
        media: mediaWithState,
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  }
);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.use("/api/media", mediaRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

app.use(
  "/api/analytics",
  analyticsRoutes
);


server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
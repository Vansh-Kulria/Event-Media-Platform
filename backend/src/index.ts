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


app.use(
  cors({
    origin: "http://localhost:3000",
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
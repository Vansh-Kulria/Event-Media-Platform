import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import {
  authenticate,
  AuthRequest,
} from "./middleware/auth.middleware";

import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
});
app.get(
  "/api/profile",
  authenticate,
  (req: AuthRequest, res) => {
    res.json(req.user);
  }
);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
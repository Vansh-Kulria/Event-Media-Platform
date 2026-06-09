import { Router } from "express";

import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller";

import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createEvent);

router.get("/", optionalAuthenticate, getEvents);

router.get("/:id", optionalAuthenticate, getEventById);

router.put(
  "/:id",
  authenticate,
  updateEvent
);

router.delete(
  "/:id",
  authenticate,
  deleteEvent
);

export default router;
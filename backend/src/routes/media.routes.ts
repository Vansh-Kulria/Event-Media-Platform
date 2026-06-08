import { Router } from "express";

import upload from "../middleware/upload.middleware";

import { authenticate }
    from "../middleware/auth.middleware";

import {
  uploadMedia,
  getEventMedia,
  deleteMedia,
} from "../controllers/media.controller";

const router = Router();

router.post(
    "/upload",
    authenticate,
    upload.single("file"),
    uploadMedia
);
    
router.get("/events/:eventId", getEventMedia);

router.delete(
  "/:id",
  authenticate,
  deleteMedia
);

export default router;
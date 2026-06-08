import { Router } from "express";

import upload from "../middleware/upload.middleware";

import { authenticate }
from "../middleware/auth.middleware";

import {
  uploadMedia,
} from "../controllers/media.controller";

const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadMedia
);

export default router;
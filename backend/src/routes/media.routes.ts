import { Router } from "express";

import upload from "../middleware/upload.middleware";

import { authenticate }
    from "../middleware/auth.middleware";

import {
  uploadMedia,
  getEventMedia,
  deleteMedia,
  toggleLike,
  getLikesCount,
  getMediaById,
  addComment,
  getComments,
  deleteComment,
  toggleFavorite,
  getMyFavorites,
  searchMedia,
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

router.post(
  "/:mediaId/like",
  authenticate,
  toggleLike
);

router.get("/:mediaId/likes", getLikesCount);

router.get(
  "/search",
  searchMedia
);

router.get(
  "/:mediaId",
  authenticate,
  getMediaById
);

router.post(
  "/:mediaId/comment",
  authenticate,
  addComment
);

router.get(
  "/:mediaId/comments",
  getComments
);

router.delete(
  "/comments/:commentId",
  authenticate,
  deleteComment
);

router.post(
  "/:mediaId/favorite",
  authenticate,
  toggleFavorite
);

router.get(
  "/favorites/me",
  authenticate,
  getMyFavorites
);


export default router;
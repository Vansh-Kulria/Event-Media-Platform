import { Router } from "express";

import upload from "../middleware/upload.middleware";

import { authenticate, optionalAuthenticate }
    from "../middleware/auth.middleware";

import {
  uploadMedia,
  uploadMediaBulk,
  getEventMedia,
  deleteMedia,
  deleteMediaBulk,
  toggleLike,
  getLikesCount,
  getMediaById,
  addComment,
  getComments,
  deleteComment,
  toggleFavorite,
  getMyFavorites,
  searchMedia,
  getMyPhotos,
  uploadSelfie,
  getMySelfie,
  recognizeFace,
  tagUser,
  getMediaTags,
  getTaggedPhotos,
  removeTag,
  downloadMedia,
  shareMedia,
  searchUsers,
} from "../controllers/media.controller";

const router = Router();

router.post(
    "/upload",
    authenticate,
    upload.single("file"),
    uploadMedia
);

router.post(
    "/upload-bulk",
    authenticate,
    upload.array("files", 20),
    uploadMediaBulk
);

router.get("/events/:eventId", optionalAuthenticate, getEventMedia);

router.delete(
    "/:id",
    authenticate,
    deleteMedia
);

router.post(
    "/delete-bulk",
    authenticate,
    deleteMediaBulk
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
  "/my-photos",
  authenticate,
  getMyPhotos
);

router.get(
  "/users/search",
  authenticate,
  searchUsers
);

router.post(
  "/upload-selfie",
  authenticate,
  upload.single("file"),
  uploadSelfie
);

router.get(
  "/my-selfie",
  authenticate,
  getMySelfie
);

router.post(
  "/recognize-face",
  authenticate,
  recognizeFace
);

router.post(
  "/:mediaId/tag",
  authenticate,
  tagUser
);

router.get(
  "/:mediaId/tags",
  getMediaTags
);

router.get(
  "/tagged/me",
  authenticate,
  getTaggedPhotos
);

router.delete(
  "/:mediaId/tag",
  authenticate,
  removeTag
);

router.get(
  "/:mediaId/download",
  authenticate,
  downloadMedia
);

router.get(
  "/:mediaId/share",
  shareMedia
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
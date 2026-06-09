import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  getUnreadCount,
  markAllRead,
  clearAllNotifications,
} from "../controllers/notification.controller";

import { authenticate }
from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getNotifications
);

router.patch(
  "/:notificationId/read",
  authenticate,
  markNotificationRead
);

router.get(
  "/unread-count",
  authenticate,
  getUnreadCount
);

router.patch(
  "/read-all",
  authenticate,
  markAllRead
);

router.delete(
  "/",
  authenticate,
  clearAllNotifications
);

export default router;
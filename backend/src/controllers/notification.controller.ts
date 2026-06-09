import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: req.user!.userId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    res.json(notifications);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const notificationId =
      req.params.notificationId as string;

    const notification =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },

        data: {
          isRead: true,
        },
      });

    res.json(notification);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update notification",
    });
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.userId,
        isRead: false,
      },
    });

    res.json({ count });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get unread count",
    });
  }
};

export const markAllRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      message: "All notifications marked as read",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};

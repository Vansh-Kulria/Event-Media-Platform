"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllNotifications = exports.markAllRead = exports.getUnreadCount = exports.markNotificationRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: {
                userId: req.user.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch notifications",
        });
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await prisma_1.default.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                isRead: true,
            },
        });
        res.json(notification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update notification",
        });
    }
};
exports.markNotificationRead = markNotificationRead;
const getUnreadCount = async (req, res) => {
    try {
        const count = await prisma_1.default.notification.count({
            where: {
                userId: req.user.userId,
                isRead: false,
            },
        });
        res.json({ count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to get unread count",
        });
    }
};
exports.getUnreadCount = getUnreadCount;
const markAllRead = async (req, res) => {
    try {
        await prisma_1.default.notification.updateMany({
            where: {
                userId: req.user.userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        res.json({
            message: "All notifications marked as read",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update notifications",
        });
    }
};
exports.markAllRead = markAllRead;
const clearAllNotifications = async (req, res) => {
    try {
        await prisma_1.default.notification.deleteMany({
            where: {
                userId: req.user.userId,
            },
        });
        res.json({
            message: "All notifications cleared",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to clear notifications",
        });
    }
};
exports.clearAllNotifications = clearAllNotifications;

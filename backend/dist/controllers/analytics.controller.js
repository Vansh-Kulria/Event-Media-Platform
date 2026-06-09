"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count();
        const totalEvents = await prisma_1.default.event.count();
        const totalMedia = await prisma_1.default.media.count();
        const totalLikes = await prisma_1.default.like.count();
        const totalComments = await prisma_1.default.comment.count();
        const totalFavorites = await prisma_1.default.favorite.count();
        const mostLikedMedia = await prisma_1.default.media.findFirst({
            orderBy: {
                likes: {
                    _count: "desc",
                },
            },
            include: {
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
        });
        const mostActiveUser = await prisma_1.default.user.findFirst({
            orderBy: {
                media: {
                    _count: "desc",
                },
            },
            include: {
                _count: {
                    select: {
                        media: true,
                    },
                },
            },
        });
        res.json({
            totalUsers,
            totalEvents,
            totalMedia,
            totalLikes,
            totalComments,
            totalFavorites,
            mostLikedMedia: mostLikedMedia
                ? {
                    id: mostLikedMedia.id,
                    url: mostLikedMedia.url,
                    likes: mostLikedMedia._count.likes,
                }
                : null,
            mostActiveUser: mostActiveUser
                ? {
                    id: mostActiveUser.id,
                    name: mostActiveUser.name,
                    uploads: mostActiveUser._count.media,
                }
                : null,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch analytics",
        });
    }
};
exports.getAnalytics = getAnalytics;

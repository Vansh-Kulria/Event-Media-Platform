import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const totalUsers =
      await prisma.user.count();

    const totalEvents =
      await prisma.event.count();

    const totalMedia =
      await prisma.media.count();

    const totalLikes =
      await prisma.like.count();

    const totalComments =
      await prisma.comment.count();

    const totalFavorites =
      await prisma.favorite.count();

    const mostLikedMedia =
      await prisma.media.findFirst({
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

    const mostActiveUser =
      await prisma.user.findFirst({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};


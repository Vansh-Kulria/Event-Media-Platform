import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const uploadMedia = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { eventId } = req.body;

    const media = await prisma.media.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        type: "IMAGE",
        eventId,
        uploadedById: req.user!.userId,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Upload failed",
    });
  }
};

interface EventParams {
  eventId: string;
}

export const getEventMedia = async (
  req: Request<EventParams>,
  res: Response
) => {
  try {
    const eventId = req.params.eventId;

    const media = await prisma.media.findMany({
      where: {
        eventId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(media);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch media",
    });
  }
};

export const deleteMedia = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const mediaId = req.params.id as string;

    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    if (
      media.uploadedById !== req.user!.userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await prisma.media.delete({
      where: {
        id: mediaId,
      },
    });

    res.json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete media",
    });
  }
};
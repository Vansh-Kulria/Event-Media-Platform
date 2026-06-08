import { Response } from "express";
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
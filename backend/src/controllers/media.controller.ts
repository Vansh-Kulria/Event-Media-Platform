import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { MediaType } from "@prisma/client/wasm";
import { generateTags } from "../services/ai.service";
import { findMatchingPhotos }
from "../services/faceMatch.service";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { getIO } from "../socket";
import { uploadToCloudinary } from "../services/cloudinary.service";
// @ts-ignore
import TextToSVG from "text-to-svg";


const optimizeImage = async (filePath: string): Promise<string> => {
    const ext = path.extname(filePath).toLowerCase();
    // Only optimize images
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return filePath;
    }
    const tempPath = filePath + "-temp";
    await sharp(filePath)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(tempPath);
    
    fs.unlinkSync(filePath);
    const newPath = filePath.substring(0, filePath.length - ext.length) + ".jpg";
    fs.renameSync(tempPath, newPath);
    return newPath;
};

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

        let finalPath = req.file.path;
        try {
            finalPath = await optimizeImage(req.file.path);
        } catch (err) {
            console.error("Optimization failed for", req.file.path, err);
        }

        let tags: string[] = [];
        if (req.body.tags) {
            tags = req.body.tags.split(",");
        } else {
            tags = await generateTags(finalPath);
        }

        const { eventId } = req.body;
        const filename = path.basename(finalPath);

        let mediaUrl = `/uploads/${filename}`;
        const cloudinaryUrl = await uploadToCloudinary(finalPath);
        if (cloudinaryUrl) {
            mediaUrl = cloudinaryUrl;
        }

        const ext = path.extname(finalPath).toLowerCase();
        const isVideo = [".mp4", ".mov", ".webm", ".avi", ".mkv"].includes(ext);
        const mediaType = isVideo ? "VIDEO" : "IMAGE";

        const media = await prisma.media.create({
            data: {
                url: mediaUrl,
                type: mediaType as any,
                eventId,
                uploadedById: req.user!.userId,
                tags,
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

export const uploadMediaBulk = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "No files uploaded",
            });
        }

        const { eventId } = req.body;
        if (!eventId) {
            return res.status(400).json({
                message: "eventId is required",
            });
        }

        const createdMedia = [];

        for (const file of files) {
            let finalPath = file.path;
            try {
                finalPath = await optimizeImage(file.path);
            } catch (err) {
                console.error("Optimization failed for", file.path, err);
            }

            let tags: string[] = [];
            if (req.body.tags) {
                tags = req.body.tags.split(",");
            } else {
                tags = await generateTags(finalPath);
            }

            const filename = path.basename(finalPath);

            let mediaUrl = `/uploads/${filename}`;
            const cloudinaryUrl = await uploadToCloudinary(finalPath);
            if (cloudinaryUrl) {
                mediaUrl = cloudinaryUrl;
            }

            const ext = path.extname(finalPath).toLowerCase();
            const isVideo = [".mp4", ".mov", ".webm", ".avi", ".mkv"].includes(ext);
            const mediaType = isVideo ? "VIDEO" : "IMAGE";

            const media = await prisma.media.create({
                data: {
                    url: mediaUrl,
                    type: mediaType as any,
                    eventId,
                    uploadedById: req.user!.userId,
                    tags,
                },
            });

            createdMedia.push(media);
        }

        res.status(201).json(createdMedia);
    } catch (error) {
        console.error("Bulk upload failed:", error);
        res.status(500).json({
            message: "Bulk upload failed",
        });
    }
};

interface EventParams {
    eventId: string;
}

export const getEventMedia = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const eventId = req.params.eventId as string;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        if (!event.isPublic) {
            const canSeePrivate = req.user && ["ADMIN", "PHOTOGRAPHER", "MEMBER"].includes(req.user.role);
            if (!canSeePrivate) {
                return res.status(403).json({
                    message: "Access forbidden. Private event.",
                });
            }
        }

        const userId = req.user?.userId;
        const media = await prisma.media.findMany({
            where: {
                eventId,
            },
            include: {
                likes: true,
                favorites: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const result = media.map(item => ({
            ...item,
            likedByCurrentUser: userId ? item.likes.some(l => l.userId === userId) : false,
            favoritedByCurrentUser: userId ? item.favorites.some(f => f.userId === userId) : false,
        }));

        res.json(result);
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
            media.uploadedById !== req.user!.userId &&
            req.user!.role !== "ADMIN"
        ) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        await prisma.like.deleteMany({
            where: {
                mediaId,
            },
        });

        await prisma.comment.deleteMany({
            where: {
                mediaId,
            },
        });

        await prisma.favorite.deleteMany({
            where: {
                mediaId,
            },
        });

        await prisma.mediaTag.deleteMany({
            where: {
                mediaId,
            },
        });

        await prisma.faceMatch.deleteMany({
            where: {
                mediaId,
            },
        });

        // Delete file from disk if it exists locally
        const filename = path.basename(media.url);
        const filePath = path.join(__dirname, "../../uploads", filename);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error(`Failed to delete local file ${filePath}`, err);
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

export const toggleLike = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const mediaId = req.params.mediaId as string;
        const userId = req.user!.userId;

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_mediaId: {
                    userId,
                    mediaId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });

            return res.json({
                liked: false,
                message: "Like removed",
            });
        }

        const media = await prisma.media.findUnique({
            where: {
                id: mediaId,
            },
        });

        await prisma.like.create({
            data: {
                userId,
                mediaId,
            },
        });

        if (
            media &&
            media.uploadedById !== userId
        ) {
            const currentUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            await prisma.notification.create({

                data: {
                    userId: media.uploadedById,
                    message: `${currentUser?.name} liked your photo`,
                },
            });

            const notification = await prisma.notification.create({
  data: {
    userId: media.uploadedById,
    message: `${currentUser?.name} liked your photo`,
  },
});

getIO()
  .to(media.uploadedById)
  .emit("notification", notification);
        }

        res.json({
            liked: true,
            message: "Photo liked",
        });
    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            message: "Failed to toggle like",
        });
    }
};

export const getLikesCount = async (
    req: Request,
    res: Response
) => {
    try {
        const mediaId = req.params.mediaId as string;

        const count = await prisma.like.count({
            where: {
                mediaId,
            },
        });

        res.json({
            likesCount: count,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch likes count",
        });
    }
};

export const getMediaById = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const mediaId = req.params.mediaId as string;
        const userId = req.user?.userId;

        const media = await prisma.media.findUnique({
            where: {
                id: mediaId,
            },
            include: {
                likes: true,
            },
        });

        if (!media) {
            return res.status(404).json({
                message: "Media not found",
            });
        }

        const likedByCurrentUser = media.likes.some(
            (like) => like.userId === userId
        );

        res.json({
            id: media.id,
            url: media.url,
            type: media.type,

            likesCount: media.likes.length,

            likedByCurrentUser,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch media",
        });
    }
};

export const addComment = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const mediaId = req.params.mediaId as string;
        const userId = req.user!.userId;
        const { content } = req.body;

        const comment = await prisma.comment.create({
            data: {
                content,
                mediaId,
                userId,
            },
        });

        const media = await prisma.media.findUnique({
            where: {
                id: mediaId,
            },
        });

        const currentUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (
            media &&
            media.uploadedById !== userId
        ) {

 const notification = await prisma.notification.create({
  data: {
    userId: media.uploadedById,
    message: `${currentUser?.name} commented on your photo`,
  },
});

getIO()
  .to(media.uploadedById)
  .emit("notification", notification);
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add comment",
        });
    }
};

export const getComments = async (
    req: Request,
    res: Response
) => {
    try {
        const mediaId = req.params.mediaId as string;

        const comments = await prisma.comment.findMany({
            where: {
                mediaId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(comments);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch comments",
        });
    }
};

export const deleteComment = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const commentId = req.params.commentId as string;

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        if (
            comment.userId !== req.user!.userId &&
            req.user!.role !== "ADMIN"
        ) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        res.json({
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete comment",
        });
    }
};


export const toggleFavorite = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const mediaId = req.params.mediaId as string;
        const userId = req.user!.userId;

        const existingFavorite =
            await prisma.favorite.findUnique({
                where: {
                    userId_mediaId: {
                        userId,
                        mediaId,
                    },
                },
            });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });

            return res.json({
                favorited: false,
            });
        }

        await prisma.favorite.create({
            data: {
                userId,
                mediaId,
            },
        });

        res.json({
            favorited: true,
        });


    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to toggle favorite",
        });
    }
};

export const getMyFavorites = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const favorites =
            await prisma.favorite.findMany({
                where: {
                    userId,
                },
                include: {
                    media: {
                        include: {
                            likes: true,
                            favorites: true,
                        }
                    },
                },
            });

        const result = favorites.map(f => ({
            ...f,
            media: {
                ...f.media,
                likedByCurrentUser: f.media.likes.some(l => l.userId === userId),
                favoritedByCurrentUser: true,
            }
        }));

        res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch favorites",
        });
    }
};

export const searchMedia = async (
    req: Request,
    res: Response
) => {
    try {
        const { tag, event, user } = req.query;

        const media = await prisma.media.findMany({
            where: {
                AND: [
                    tag
                        ? {
                            tags: {
                                has: tag as string,
                            },
                        }
                        : {},

                    event
                        ? {
                            event: {
                                title: {
                                    contains: event as string,
                                    mode: "insensitive",
                                },
                            },
                        }
                        : {},

                    user
                        ? {
                            uploadedBy: {
                                name: {
                                    contains: user as string,
                                    mode: "insensitive",
                                },
                            },
                        }
                        : {},
                ],
            },

            include: {
                event: true,
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.json(media);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Search failed",
        });
    }
};

export const getMyPhotos = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const photos = await prisma.faceMatch.findMany({
            where: {
                userId,
            },

            include: {
                media: {
                    include: {
                        likes: true,
                        favorites: true,
                    }
                },
            },
        });

        const result = photos.map(match => ({
            ...match,
            media: {
                ...match.media,
                likedByCurrentUser: match.media.likes.some(l => l.userId === userId),
                favoritedByCurrentUser: match.media.favorites.some(f => f.userId === userId),
            }
        }));

        res.json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch photos",
        });
    }
};


export const uploadSelfie = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No selfie uploaded",
            });
        }

        let selfieUrl = `/uploads/${req.file.filename}`;
        const cloudinaryUrl = await uploadToCloudinary(req.file.path);
        if (cloudinaryUrl) {
            selfieUrl = cloudinaryUrl;
        }

        const user = await prisma.user.update({
            where: {
                id: req.user!.userId,
            },
            data: {
                selfieUrl,
            },
        });

        res.json({
            message: "Selfie uploaded",
            selfieUrl: user.selfieUrl,
        });

        const selfiePath = `uploads/${req.file.filename}`;

const matches = await findMatchingPhotos(
  selfiePath
);
console.log("MATCHES:", matches);

for (const matchPath of matches) {
  const normalizedPath =
    "/" + matchPath.replace(/\\/g, "/");

  // Skip the selfie itself
  if (normalizedPath.includes(req.file.filename)) {
    continue;
  }

  const filename = path.basename(matchPath);
  const media = await prisma.media.findFirst({
    where: {
      url: {
        contains: filename,
      },
    },
  });

  if (!media) continue;

  await prisma.faceMatch.upsert({
    where: {
      userId_mediaId: {
        userId: user.id,
        mediaId: media.id,
      },
    },

    update: {},

    create: {
      userId: user.id,
      mediaId: media.id,
      confidence: 0.95,
    },
  });
}

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to upload selfie",
        });
    }
};


export const getMySelfie = async (
    req: AuthRequest,
    res: Response
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user!.userId,
        },
        select: {
            selfieUrl: true,
        },
    });

    res.json(user);
};

export const recognizeFace = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user?.selfieUrl) {
            return res.status(400).json({
                message: "Upload a selfie first",
            });
        }

        // Clean up old matches for this user
        await prisma.faceMatch.deleteMany({
            where: {
                userId,
            },
        });

        const selfieBasename = path.basename(user.selfieUrl, path.extname(user.selfieUrl));
        const uploadsDir = path.join(__dirname, "../../uploads");
        const files = fs.readdirSync(uploadsDir);
        const matchingFile = files.find(file => path.basename(file, path.extname(file)) === selfieBasename);
        
        if (!matchingFile) {
            return res.status(400).json({
                message: "Reference selfie local file not found on server disk",
            });
        }
        const selfiePath = `uploads/${matchingFile}`;

        let matchesCreated = 0;
        const matches = await findMatchingPhotos(selfiePath);

        for (const matchPath of matches) {
            const normalizedPath = "/" + matchPath.replace(/\\/g, "/");

            if (normalizedPath.includes(selfieBasename)) {
                continue;
            }

            const filename = path.basename(matchPath);
            const mediaItem = await prisma.media.findFirst({
                where: {
                    url: {
                        contains: filename,
                    },
                },
            });

            if (!mediaItem) continue;

            await prisma.faceMatch.create({
                data: {
                    userId,
                    mediaId: mediaItem.id,
                    confidence: 0.95,
                },
            });

            matchesCreated++;
        }

        res.json({
            message: "Face recognition completed",
            matchesCreated,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Recognition failed",
        });
    }
};

export const tagUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const mediaId = req.params.mediaId as string;
    const taggedUserId = req.body.userId;
    const taggedById = req.user!.userId;

    const tag = await prisma.mediaTag.create({
      data: {
        mediaId,
        userId: taggedUserId,
        taggedById,
      },
    });

    res.status(201).json(tag);

    const currentUser = await prisma.user.findUnique({
  where: {
    id: taggedById,
  },
});

const notification = await prisma.notification.create({
  data: {
    userId: taggedUserId,
    message: `${currentUser?.name} tagged you in a photo`,
  },
});
 getIO()
  .to(taggedUserId)
  .emit("notification", notification);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to tag user",
    });
  }

};

export const getMediaTags = async (
  req: Request,
  res: Response
) => {
  const mediaId = req.params.mediaId as string;

  const tags = await prisma.mediaTag.findMany({
    where: {
      mediaId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(tags);
};

export const getTaggedPhotos = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;

    const taggedPhotos =
      await prisma.mediaTag.findMany({
        where: {
          userId,
        },

        include: {
          media: {
            include: {
              event: true,
            },
          },
        },
      });

    res.json(taggedPhotos);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tagged photos",
    });
  }
};

export const removeTag = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const mediaId = req.params.mediaId as string;
    const userId = req.body.userId as string;

    await prisma.mediaTag.delete({
      where: {
        userId_mediaId: {
          mediaId,
          userId,
        },
      },
    });

    res.json({
      message: "Tag removed",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to remove tag",
    });
  }
};

export const downloadMedia = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const mediaId = req.params.mediaId as string;

    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
      },
      include: {
        event: true,
      },
    });

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    let inputBuffer: Buffer;
    if (media.url.startsWith("http")) {
      const response = await fetch(media.url);
      if (!response.ok) throw new Error("Failed to fetch media from Cloudinary");
      const arrayBuffer = await response.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    } else {
      const imagePath = path.join(
        process.cwd(),
        media.url.replace(/^\//, "")
      );
      inputBuffer = fs.readFileSync(imagePath);
    }

    if (media.type === "VIDEO") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${media.id}.mp4`
      );
      res.setHeader("Content-Type", "video/mp4");
      return res.send(inputBuffer);
    }

    const userRole = req.user?.role || "GUEST";
    const clubName = "Event Media Club";
    const eventName = media.event.title;
    const watermarkText = `${clubName} | ${eventName} | ${userRole}`;

    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1000;
    const height = metadata.height || 1000;
    
    // Load custom font using text-to-svg
    const fontPath = path.join(__dirname, "../../fonts/Roboto-Regular.ttf");
    const textToSVG = TextToSVG.loadSync(fontPath);

    // Dynamically scale text size based on image width and length of watermark text
    let fontSize = Math.max(24, Math.floor(width / 25));
    const maxTextWidth = width * 0.85; // Leave at least 7.5% margin on each side
    const metrics = textToSVG.getMetrics(watermarkText, { fontSize });
    if (metrics.width > maxTextWidth) {
      fontSize = Math.max(16, Math.floor(fontSize * (maxTextWidth / metrics.width)));
    }

    // Generate path element with white fill and black outline (paint-order renders outline behind text)
    const pathData = textToSVG.getPath(watermarkText, {
      x: width / 2,
      y: height / 2,
      fontSize: fontSize,
      anchor: "center middle",
      attributes: {
        fill: "white",
        stroke: "black",
        "stroke-width": (Math.max(1.5, fontSize / 12)).toFixed(1),
        "paint-order": "stroke fill",
        "stroke-linejoin": "round",
        opacity: "0.8",
      },
    });

    const watermark = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${pathData}
      </svg>
    `;

    const output = await image
      .composite([
        {
          input: Buffer.from(watermark),
          gravity: "center",
        },
      ])
      .jpeg()
      .toBuffer();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${media.id}.jpg`
    );

    res.setHeader(
      "Content-Type",
      "image/jpeg"
    );

    res.send(output);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Download failed",
    });
  }
};

export const shareMedia = async (
  req: Request,
  res: Response
) => {
  try {
    const mediaId = req.params.mediaId as string;

    const media = await prisma.media.update({
      where: {
        id: mediaId,
      },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });

    const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const cleanFrontendUrl = rawFrontendUrl.endsWith("/") ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;
    const shareUrl = `${cleanFrontendUrl}/shared/${media.id}`;

    res.json({
      shareUrl,
      shareCount: media.shareCount,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to share media",
    });
  }
};

export const searchUsers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const q = (req.query.q as string) || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to search users",
    });
  }
};

export const deleteMediaBulk = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { mediaIds } = req.body;
        if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
            return res.status(400).json({
                message: "mediaIds must be a non-empty array",
            });
        }

        const mediaRecords = await prisma.media.findMany({
            where: {
                id: {
                    in: mediaIds,
                },
            },
        });

        if (mediaRecords.length === 0) {
            return res.status(404).json({
                message: "No media found",
            });
        }

        const isUserAdmin = req.user!.role === "ADMIN";
        if (!isUserAdmin) {
            const forbiddenMedia = mediaRecords.some(media => media.uploadedById !== req.user!.userId);
            if (forbiddenMedia) {
                return res.status(403).json({
                    message: "Forbidden: You do not have permission to delete some of the selected media",
                });
            }
        }

        for (const media of mediaRecords) {
            const mediaId = media.id;

            await prisma.like.deleteMany({ where: { mediaId } });
            await prisma.comment.deleteMany({ where: { mediaId } });
            await prisma.favorite.deleteMany({ where: { mediaId } });
            await prisma.mediaTag.deleteMany({ where: { mediaId } });
            await prisma.faceMatch.deleteMany({ where: { mediaId } });

            const filename = path.basename(media.url);
            const filePath = path.join(__dirname, "../../uploads", filename);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error(`Failed to delete local file ${filePath}`, err);
            }
        }

        await prisma.media.deleteMany({
            where: {
                id: {
                    in: mediaIds,
                },
            },
        });

        res.json({
            message: `${mediaRecords.length} media deleted successfully`,
        });
    } catch (error) {
        console.error("Bulk delete failed:", error);
        res.status(500).json({
            message: "Failed to delete media bulk",
        });
    }
};

import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { MediaType } from "@prisma/client/wasm";
import { generateTags } from "../services/ai.service";
import { findMatchingPhotos }
from "../services/faceMatch.service";
import sharp from "sharp";
import path from "path";
import { getIO } from "../socket";


export const uploadMedia = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        // ******************************
        console.log("BODY:", req.body);
        console.log("RAW TAGS:", req.body.tags);

        let tags: string[] = [];

        if (req.body.tags) {
            tags = req.body.tags.split(",");
        } else {
            tags = await generateTags(req.file!.path);
        }

        console.log("PARSED TAGS:", tags);

        // *******************************


        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        const { eventId } = req.body;

        const media = await prisma.media.create({
            data: {
                url: `/uploads/${req.file.filename}`,
                type: MediaType.IMAGE,
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
                    media: true,
                },
            });

        res.json(favorites);
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
                media: true,
            },
        });

        res.json(photos);

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

        const user = await prisma.user.update({
            where: {
                id: req.user!.userId,
            },
            data: {
                selfieUrl: `/uploads/${req.file.filename}`,
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
  if (
    normalizedPath ===
    `/uploads/${req.file.filename}`
  ) {
    continue;
  }

  const media = await prisma.media.findFirst({
    where: {
      url: normalizedPath,
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

        const media = await prisma.media.findMany();

        let matchesCreated = 0;

        for (const photo of media) {
            await prisma.faceMatch.upsert({
                where: {
                    userId_mediaId: {
                        userId,
                        mediaId: photo.id,
                    },
                },
                update: {
                    confidence: 0.95,
                },
                create: {
                    userId,
                    mediaId: photo.id,
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

    const imagePath = path.join(
      process.cwd(),
      media.url.replace("/", "")
    );

    const watermark = `
      <svg width="1000" height="200">
        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          font-size="40"
          fill="white"
          opacity="0.4"
        >
          ${media.event.title}
        </text>
      </svg>
    `;

    const output = await sharp(imagePath)
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

    const shareUrl =
      `${req.protocol}://${req.get("host")}/api/media/${media.id}`;

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

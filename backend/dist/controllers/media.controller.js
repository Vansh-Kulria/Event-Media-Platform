"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaBulk = exports.searchUsers = exports.shareMedia = exports.downloadMedia = exports.removeTag = exports.getTaggedPhotos = exports.getMediaTags = exports.tagUser = exports.recognizeFace = exports.getMySelfie = exports.uploadSelfie = exports.getMyPhotos = exports.searchMedia = exports.getMyFavorites = exports.toggleFavorite = exports.deleteComment = exports.getComments = exports.addComment = exports.getMediaById = exports.getLikesCount = exports.toggleLike = exports.deleteMedia = exports.getEventMedia = exports.uploadMediaBulk = exports.uploadMedia = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ai_service_1 = require("../services/ai.service");
const faceMatch_service_1 = require("../services/faceMatch.service");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const socket_1 = require("../socket");
const cloudinary_service_1 = require("../services/cloudinary.service");
// @ts-ignore
const text_to_svg_1 = __importDefault(require("text-to-svg"));
const optimizeImage = async (filePath) => {
    const ext = path_1.default.extname(filePath).toLowerCase();
    // Only optimize images
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return filePath;
    }
    const tempPath = filePath + "-temp";
    await (0, sharp_1.default)(filePath)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(tempPath);
    fs_1.default.unlinkSync(filePath);
    const newPath = filePath.substring(0, filePath.length - ext.length) + ".jpg";
    fs_1.default.renameSync(tempPath, newPath);
    return newPath;
};
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }
        let finalPath = req.file.path;
        try {
            finalPath = await optimizeImage(req.file.path);
        }
        catch (err) {
            console.error("Optimization failed for", req.file.path, err);
        }
        let tags = [];
        if (req.body.tags) {
            tags = req.body.tags.split(",");
        }
        else {
            tags = await (0, ai_service_1.generateTags)(finalPath);
        }
        const { eventId } = req.body;
        const filename = path_1.default.basename(finalPath);
        let mediaUrl = `/uploads/${filename}`;
        const cloudinaryUrl = await (0, cloudinary_service_1.uploadToCloudinary)(finalPath);
        if (cloudinaryUrl) {
            mediaUrl = cloudinaryUrl;
        }
        const ext = path_1.default.extname(finalPath).toLowerCase();
        const isVideo = [".mp4", ".mov", ".webm", ".avi", ".mkv"].includes(ext);
        const mediaType = isVideo ? "VIDEO" : "IMAGE";
        const media = await prisma_1.default.media.create({
            data: {
                url: mediaUrl,
                type: mediaType,
                eventId,
                uploadedById: req.user.userId,
                tags,
            },
        });
        res.status(201).json(media);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Upload failed",
        });
    }
};
exports.uploadMedia = uploadMedia;
const uploadMediaBulk = async (req, res) => {
    try {
        const files = req.files;
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
            }
            catch (err) {
                console.error("Optimization failed for", file.path, err);
            }
            let tags = [];
            if (req.body.tags) {
                tags = req.body.tags.split(",");
            }
            else {
                tags = await (0, ai_service_1.generateTags)(finalPath);
            }
            const filename = path_1.default.basename(finalPath);
            let mediaUrl = `/uploads/${filename}`;
            const cloudinaryUrl = await (0, cloudinary_service_1.uploadToCloudinary)(finalPath);
            if (cloudinaryUrl) {
                mediaUrl = cloudinaryUrl;
            }
            const ext = path_1.default.extname(finalPath).toLowerCase();
            const isVideo = [".mp4", ".mov", ".webm", ".avi", ".mkv"].includes(ext);
            const mediaType = isVideo ? "VIDEO" : "IMAGE";
            const media = await prisma_1.default.media.create({
                data: {
                    url: mediaUrl,
                    type: mediaType,
                    eventId,
                    uploadedById: req.user.userId,
                    tags,
                },
            });
            createdMedia.push(media);
        }
        res.status(201).json(createdMedia);
    }
    catch (error) {
        console.error("Bulk upload failed:", error);
        res.status(500).json({
            message: "Bulk upload failed",
        });
    }
};
exports.uploadMediaBulk = uploadMediaBulk;
const getEventMedia = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await prisma_1.default.event.findUnique({
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
        const media = await prisma_1.default.media.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch media",
        });
    }
};
exports.getEventMedia = getEventMedia;
const deleteMedia = async (req, res) => {
    try {
        const mediaId = req.params.id;
        const media = await prisma_1.default.media.findUnique({
            where: {
                id: mediaId,
            },
        });
        if (!media) {
            return res.status(404).json({
                message: "Media not found",
            });
        }
        if (media.uploadedById !== req.user.userId &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Forbidden",
            });
        }
        await prisma_1.default.like.deleteMany({
            where: {
                mediaId,
            },
        });
        await prisma_1.default.comment.deleteMany({
            where: {
                mediaId,
            },
        });
        await prisma_1.default.favorite.deleteMany({
            where: {
                mediaId,
            },
        });
        await prisma_1.default.mediaTag.deleteMany({
            where: {
                mediaId,
            },
        });
        await prisma_1.default.faceMatch.deleteMany({
            where: {
                mediaId,
            },
        });
        // Delete file from disk if it exists locally
        const filename = path_1.default.basename(media.url);
        const filePath = path_1.default.join(__dirname, "../../uploads", filename);
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (err) {
            console.error(`Failed to delete local file ${filePath}`, err);
        }
        await prisma_1.default.media.delete({
            where: {
                id: mediaId,
            },
        });
        res.json({
            message: "Media deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete media",
        });
    }
};
exports.deleteMedia = deleteMedia;
const toggleLike = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.user.userId;
        const existingLike = await prisma_1.default.like.findUnique({
            where: {
                userId_mediaId: {
                    userId,
                    mediaId,
                },
            },
        });
        if (existingLike) {
            await prisma_1.default.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return res.json({
                liked: false,
                message: "Like removed",
            });
        }
        const media = await prisma_1.default.media.findUnique({
            where: {
                id: mediaId,
            },
        });
        await prisma_1.default.like.create({
            data: {
                userId,
                mediaId,
            },
        });
        if (media &&
            media.uploadedById !== userId) {
            const currentUser = await prisma_1.default.user.findUnique({
                where: {
                    id: userId,
                },
            });
            await prisma_1.default.notification.create({
                data: {
                    userId: media.uploadedById,
                    message: `${currentUser?.name} liked your photo`,
                },
            });
            const notification = await prisma_1.default.notification.create({
                data: {
                    userId: media.uploadedById,
                    message: `${currentUser?.name} liked your photo`,
                },
            });
            (0, socket_1.getIO)()
                .to(media.uploadedById)
                .emit("notification", notification);
        }
        res.json({
            liked: true,
            message: "Photo liked",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to toggle like",
        });
    }
};
exports.toggleLike = toggleLike;
const getLikesCount = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const count = await prisma_1.default.like.count({
            where: {
                mediaId,
            },
        });
        res.json({
            likesCount: count,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch likes count",
        });
    }
};
exports.getLikesCount = getLikesCount;
const getMediaById = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.user?.userId;
        const media = await prisma_1.default.media.findUnique({
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
        const likedByCurrentUser = media.likes.some((like) => like.userId === userId);
        res.json({
            id: media.id,
            url: media.url,
            type: media.type,
            likesCount: media.likes.length,
            likedByCurrentUser,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch media",
        });
    }
};
exports.getMediaById = getMediaById;
const addComment = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.user.userId;
        const { content } = req.body;
        const comment = await prisma_1.default.comment.create({
            data: {
                content,
                mediaId,
                userId,
            },
        });
        const media = await prisma_1.default.media.findUnique({
            where: {
                id: mediaId,
            },
        });
        const currentUser = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (media &&
            media.uploadedById !== userId) {
            const notification = await prisma_1.default.notification.create({
                data: {
                    userId: media.uploadedById,
                    message: `${currentUser?.name} commented on your photo`,
                },
            });
            (0, socket_1.getIO)()
                .to(media.uploadedById)
                .emit("notification", notification);
        }
        res.status(201).json(comment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to add comment",
        });
    }
};
exports.addComment = addComment;
const getComments = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const comments = await prisma_1.default.comment.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch comments",
        });
    }
};
exports.getComments = getComments;
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const comment = await prisma_1.default.comment.findUnique({
            where: {
                id: commentId,
            },
        });
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }
        if (comment.userId !== req.user.userId &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Forbidden",
            });
        }
        await prisma_1.default.comment.delete({
            where: {
                id: commentId,
            },
        });
        res.json({
            message: "Comment deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete comment",
        });
    }
};
exports.deleteComment = deleteComment;
const toggleFavorite = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.user.userId;
        const existingFavorite = await prisma_1.default.favorite.findUnique({
            where: {
                userId_mediaId: {
                    userId,
                    mediaId,
                },
            },
        });
        if (existingFavorite) {
            await prisma_1.default.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });
            return res.json({
                favorited: false,
            });
        }
        await prisma_1.default.favorite.create({
            data: {
                userId,
                mediaId,
            },
        });
        res.json({
            favorited: true,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to toggle favorite",
        });
    }
};
exports.toggleFavorite = toggleFavorite;
const getMyFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const favorites = await prisma_1.default.favorite.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch favorites",
        });
    }
};
exports.getMyFavorites = getMyFavorites;
const searchMedia = async (req, res) => {
    try {
        const { tag, event, user } = req.query;
        const media = await prisma_1.default.media.findMany({
            where: {
                AND: [
                    tag
                        ? {
                            tags: {
                                has: tag,
                            },
                        }
                        : {},
                    event
                        ? {
                            event: {
                                title: {
                                    contains: event,
                                    mode: "insensitive",
                                },
                            },
                        }
                        : {},
                    user
                        ? {
                            uploadedBy: {
                                name: {
                                    contains: user,
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Search failed",
        });
    }
};
exports.searchMedia = searchMedia;
const getMyPhotos = async (req, res) => {
    try {
        const userId = req.user.userId;
        const photos = await prisma_1.default.faceMatch.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch photos",
        });
    }
};
exports.getMyPhotos = getMyPhotos;
const uploadSelfie = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No selfie uploaded",
            });
        }
        let selfieUrl = `/uploads/${req.file.filename}`;
        const cloudinaryUrl = await (0, cloudinary_service_1.uploadToCloudinary)(req.file.path);
        if (cloudinaryUrl) {
            selfieUrl = cloudinaryUrl;
        }
        const user = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
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
        const matches = await (0, faceMatch_service_1.findMatchingPhotos)(selfiePath);
        console.log("MATCHES:", matches);
        for (const matchPath of matches) {
            const normalizedPath = "/" + matchPath.replace(/\\/g, "/");
            // Skip the selfie itself
            if (normalizedPath.includes(req.file.filename)) {
                continue;
            }
            const filename = path_1.default.basename(matchPath);
            const media = await prisma_1.default.media.findFirst({
                where: {
                    url: {
                        contains: filename,
                    },
                },
            });
            if (!media)
                continue;
            await prisma_1.default.faceMatch.upsert({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to upload selfie",
        });
    }
};
exports.uploadSelfie = uploadSelfie;
const getMySelfie = async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: req.user.userId,
        },
        select: {
            selfieUrl: true,
        },
    });
    res.json(user);
};
exports.getMySelfie = getMySelfie;
const recognizeFace = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
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
        await prisma_1.default.faceMatch.deleteMany({
            where: {
                userId,
            },
        });
        const selfieBasename = path_1.default.basename(user.selfieUrl, path_1.default.extname(user.selfieUrl));
        const uploadsDir = path_1.default.join(__dirname, "../../uploads");
        const files = fs_1.default.readdirSync(uploadsDir);
        const matchingFile = files.find(file => path_1.default.basename(file, path_1.default.extname(file)) === selfieBasename);
        if (!matchingFile) {
            return res.status(400).json({
                message: "Reference selfie local file not found on server disk",
            });
        }
        const selfiePath = `uploads/${matchingFile}`;
        let matchesCreated = 0;
        const matches = await (0, faceMatch_service_1.findMatchingPhotos)(selfiePath);
        for (const matchPath of matches) {
            const normalizedPath = "/" + matchPath.replace(/\\/g, "/");
            if (normalizedPath.includes(selfieBasename)) {
                continue;
            }
            const filename = path_1.default.basename(matchPath);
            const mediaItem = await prisma_1.default.media.findFirst({
                where: {
                    url: {
                        contains: filename,
                    },
                },
            });
            if (!mediaItem)
                continue;
            await prisma_1.default.faceMatch.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Recognition failed",
        });
    }
};
exports.recognizeFace = recognizeFace;
const tagUser = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const taggedUserId = req.body.userId;
        const taggedById = req.user.userId;
        const tag = await prisma_1.default.mediaTag.create({
            data: {
                mediaId,
                userId: taggedUserId,
                taggedById,
            },
        });
        res.status(201).json(tag);
        const currentUser = await prisma_1.default.user.findUnique({
            where: {
                id: taggedById,
            },
        });
        const notification = await prisma_1.default.notification.create({
            data: {
                userId: taggedUserId,
                message: `${currentUser?.name} tagged you in a photo`,
            },
        });
        (0, socket_1.getIO)()
            .to(taggedUserId)
            .emit("notification", notification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to tag user",
        });
    }
};
exports.tagUser = tagUser;
const getMediaTags = async (req, res) => {
    const mediaId = req.params.mediaId;
    const tags = await prisma_1.default.mediaTag.findMany({
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
exports.getMediaTags = getMediaTags;
const getTaggedPhotos = async (req, res) => {
    try {
        const userId = req.user.userId;
        const taggedPhotos = await prisma_1.default.mediaTag.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch tagged photos",
        });
    }
};
exports.getTaggedPhotos = getTaggedPhotos;
const removeTag = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const userId = req.body.userId;
        await prisma_1.default.mediaTag.delete({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to remove tag",
        });
    }
};
exports.removeTag = removeTag;
const downloadMedia = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const media = await prisma_1.default.media.findUnique({
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
        let inputBuffer;
        if (media.url.startsWith("http")) {
            const response = await fetch(media.url);
            if (!response.ok)
                throw new Error("Failed to fetch media from Cloudinary");
            const arrayBuffer = await response.arrayBuffer();
            inputBuffer = Buffer.from(arrayBuffer);
        }
        else {
            const imagePath = path_1.default.join(process.cwd(), media.url.replace(/^\//, ""));
            inputBuffer = fs_1.default.readFileSync(imagePath);
        }
        if (media.type === "VIDEO") {
            res.setHeader("Content-Disposition", `attachment; filename=${media.id}.mp4`);
            res.setHeader("Content-Type", "video/mp4");
            return res.send(inputBuffer);
        }
        const userRole = req.user?.role || "GUEST";
        const clubName = "Event Media Club";
        const eventName = media.event.title;
        const watermarkText = `${clubName} | ${eventName} | ${userRole}`;
        const image = (0, sharp_1.default)(inputBuffer);
        const metadata = await image.metadata();
        const width = metadata.width || 1000;
        const height = metadata.height || 1000;
        // Dynamically scale text size based on image width
        const fontSize = Math.max(24, Math.floor(width / 25));
        // Load custom font using text-to-svg
        const fontPath = path_1.default.join(__dirname, "../../fonts/Roboto-Regular.ttf");
        const textToSVG = text_to_svg_1.default.loadSync(fontPath);
        // Generate path element for the text
        const pathData = textToSVG.getPath(watermarkText, {
            x: width / 2,
            y: height / 2,
            fontSize: fontSize,
            anchor: "center middle",
            attributes: {
                fill: "white",
                opacity: "0.6",
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
        res.setHeader("Content-Disposition", `attachment; filename=${media.id}.jpg`);
        res.setHeader("Content-Type", "image/jpeg");
        res.send(output);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Download failed",
        });
    }
};
exports.downloadMedia = downloadMedia;
const shareMedia = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const media = await prisma_1.default.media.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to share media",
        });
    }
};
exports.shareMedia = shareMedia;
const searchUsers = async (req, res) => {
    try {
        const q = req.query.q || "";
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to search users",
        });
    }
};
exports.searchUsers = searchUsers;
const deleteMediaBulk = async (req, res) => {
    try {
        const { mediaIds } = req.body;
        if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
            return res.status(400).json({
                message: "mediaIds must be a non-empty array",
            });
        }
        const mediaRecords = await prisma_1.default.media.findMany({
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
        const isUserAdmin = req.user.role === "ADMIN";
        if (!isUserAdmin) {
            const forbiddenMedia = mediaRecords.some(media => media.uploadedById !== req.user.userId);
            if (forbiddenMedia) {
                return res.status(403).json({
                    message: "Forbidden: You do not have permission to delete some of the selected media",
                });
            }
        }
        for (const media of mediaRecords) {
            const mediaId = media.id;
            await prisma_1.default.like.deleteMany({ where: { mediaId } });
            await prisma_1.default.comment.deleteMany({ where: { mediaId } });
            await prisma_1.default.favorite.deleteMany({ where: { mediaId } });
            await prisma_1.default.mediaTag.deleteMany({ where: { mediaId } });
            await prisma_1.default.faceMatch.deleteMany({ where: { mediaId } });
            const filename = path_1.default.basename(media.url);
            const filePath = path_1.default.join(__dirname, "../../uploads", filename);
            try {
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            catch (err) {
                console.error(`Failed to delete local file ${filePath}`, err);
            }
        }
        await prisma_1.default.media.deleteMany({
            where: {
                id: {
                    in: mediaIds,
                },
            },
        });
        res.json({
            message: `${mediaRecords.length} media deleted successfully`,
        });
    }
    catch (error) {
        console.error("Bulk delete failed:", error);
        res.status(500).json({
            message: "Failed to delete media bulk",
        });
    }
};
exports.deleteMediaBulk = deleteMediaBulk;

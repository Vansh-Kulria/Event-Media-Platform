"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const prisma_1 = __importDefault(require("./lib/prisma"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, socket_1.initSocket)(server);
const PORT = process.env.PORT || 5000;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_middleware_1 = require("./middleware/auth.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const cleanFrontendUrl = rawFrontendUrl.endsWith("/") ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;
app.use((0, cors_1.default)({
    origin: [cleanFrontendUrl, `${cleanFrontendUrl}/`],
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Backend Running");
});
app.get("/api/profile", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                selfieUrl: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});
app.get("/api/users/:userId/profile", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const viewerId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                selfieUrl: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const media = await prisma_1.default.media.findMany({
            where: { uploadedById: targetUserId },
            include: {
                event: true,
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                favorites: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const mediaWithState = media.map((item) => ({
            ...item,
            likedByCurrentUser: item.likes.some((l) => l.userId === viewerId),
            favoritedByCurrentUser: item.favorites.some((f) => f.userId === viewerId),
        }));
        res.json({
            user,
            media: mediaWithState,
        });
    }
    catch (error) {
        console.error("Failed to fetch user profile:", error);
        res.status(500).json({ message: "Failed to fetch user profile" });
    }
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/events", event_routes_1.default);
app.use("/api/media", media_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api/analytics", analytics_routes_1.default);
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

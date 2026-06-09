"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createEvent = async (req, res) => {
    try {
        const { title, description, category, eventDate, isPublic } = req.body;
        const event = await prisma_1.default.event.create({
            data: {
                title,
                description,
                category,
                eventDate: new Date(eventDate),
                isPublic,
                createdById: req.user.userId
            }
        });
        res.status(201).json(event);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create event"
        });
    }
};
exports.createEvent = createEvent;
const getEvents = async (req, res) => {
    try {
        const { sortBy, order } = req.query;
        const canSeePrivate = req.user && ["ADMIN", "PHOTOGRAPHER", "MEMBER"].includes(req.user.role);
        const where = canSeePrivate ? {} : { isPublic: true };
        let orderBy = { createdAt: "desc" };
        if (sortBy) {
            const sortOrder = order === "asc" ? "asc" : "desc";
            if (sortBy === "name") {
                orderBy = { title: sortOrder };
            }
            else if (sortBy === "date") {
                orderBy = { eventDate: sortOrder };
            }
            else if (sortBy === "category") {
                orderBy = { category: sortOrder };
            }
        }
        const events = await prisma_1.default.event.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy,
        });
        res.json(events);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch events",
        });
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await prisma_1.default.event.findUnique({
            where: {
                id: eventId,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
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
        res.json(event);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch event",
        });
    }
};
exports.getEventById = getEventById;
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await prisma_1.default.event.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }
        if (event.createdById !== req.user.userId) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }
        const updateData = {
            ...req.body,
        };
        if (updateData.eventDate) {
            updateData.eventDate = new Date(updateData.eventDate);
        }
        const updatedEvent = await prisma_1.default.event.update({
            where: {
                id: eventId,
            },
            data: updateData,
        });
        res.json(updatedEvent);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to update event",
            error: error.message,
        });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await prisma_1.default.event.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }
        if (event.createdById !== req.user.userId) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }
        await prisma_1.default.event.delete({
            where: {
                id: eventId,
            },
        });
        res.json({
            message: "Event deleted",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete event",
        });
    }
};
exports.deleteEvent = deleteEvent;

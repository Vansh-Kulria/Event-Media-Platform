import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const createEvent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      isPublic
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        eventDate: new Date(eventDate),
        isPublic,
        createdById: req.user!.userId
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create event"
    });
  }
};

export const getEvents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { sortBy, order } = req.query;

    const canSeePrivate = req.user && ["ADMIN", "PHOTOGRAPHER", "MEMBER"].includes(req.user.role);
    const where = canSeePrivate ? {} : { isPublic: true };

    let orderBy: any = { createdAt: "desc" };

    if (sortBy) {
      const sortOrder = order === "asc" ? "asc" : "desc";
      if (sortBy === "name") {
        orderBy = { title: sortOrder };
      } else if (sortBy === "date") {
        orderBy = { eventDate: sortOrder };
      } else if (sortBy === "category") {
        orderBy = { category: sortOrder };
      }
    }

    const events = await prisma.event.findMany({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
};

export const getEventById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;

    const event = await prisma.event.findUnique({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch event",
    });
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      event.createdById !== req.user!.userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

const updateData = {
  ...req.body,
};

if (updateData.eventDate) {
  updateData.eventDate = new Date(
    updateData.eventDate
  );
}

const updatedEvent =
  await prisma.event.update({
    where: {
      id: eventId,
    },
    data: updateData,
  });

    res.json(updatedEvent);
  } catch (error: any) {
  console.error(error.message);

  res.status(500).json({
    message: "Failed to update event",
    error: error.message,
  });
}
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      event.createdById !== req.user!.userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    res.json({
      message: "Event deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete event",
    });
  }
};


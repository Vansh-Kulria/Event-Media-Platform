import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

import { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET as string
) as CustomJwtPayload;

req.user = {
  userId: decoded.userId,
  role: decoded.role,
};

    req.user = decoded;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  id: string;
  name: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as TokenPayload;
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}


import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed.",
      details: error.errors.map((item) => ({
        path: item.path.join("."),
        message: item.message
      }))
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof Error && error.name === "CastError") {
    return res.status(404).json({ message: "Resource was not found." });
  }

  console.error(error);
  return res.status(500).json({ message: "Something went wrong on the server." });
}


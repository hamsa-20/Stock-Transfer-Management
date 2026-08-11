import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];

    return res.status(400).json({
      message: firstIssue?.message || "Validation failed",
      issues: error.flatten()
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "A record with that value already exists." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Requested record was not found." });
    }
  }

  if (error instanceof Error) {
    const knownMessages = [
      "Source and destination warehouses must be different.",
      "Source warehouse does not have enough stock.",
      "Only PENDING transfers can be approved.",
      "Only PENDING or APPROVED transfers can be cancelled.",
      "Only APPROVED transfers can be completed.",
      "Cannot complete a cancelled transfer.",
      "Warehouse not found."
    ];

    if (knownMessages.includes(error.message)) {
      return res.status(409).json({ message: error.message });
    }
  }

  return res.status(500).json({ message: "Internal server error." });
}

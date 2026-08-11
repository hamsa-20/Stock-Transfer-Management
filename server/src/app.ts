import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import warehouseRouter from "./routes/warehouses";
import transferRouter from "./routes/transfers";
import { errorHandler, notFound } from "./middleware/errors";

export const prisma = new PrismaClient();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: false
}));
app.use(express.json({ limit: "1mb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/warehouses", warehouseRouter);
app.use("/api/transfers", transferRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../app";

const router = Router();

const warehouseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  stock: z.number().int().min(0).max(1_000_000).default(0)
});

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  location: z.string().trim().min(2).max(120).optional(),
  stock: z.number().int().min(0).max(1_000_000).optional()
}).refine((data) => Object.keys(data).length > 0, "At least one field is required.");

router.get("/", async (_req, res, next) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { outgoingTransfers: true, incomingTransfers: true }
        }
      }
    });
    res.json(warehouses);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: req.params.id },
      include: {
        outgoingTransfers: { orderBy: { createdAt: "desc" }, take: 10 },
        incomingTransfers: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });

    if (!warehouse) return res.status(404).json({ message: "Warehouse not found." });
    res.json(warehouse);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const input = warehouseSchema.parse(req.body);
    const warehouse = await prisma.warehouse.create({ data: input });
    res.status(201).json(warehouse);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const input = updateSchema.parse(req.body);
    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id },
      data: input
    });
    res.json(warehouse);
  } catch (error) {
    next(error);
  }
});

export default router;

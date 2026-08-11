import { Router } from "express";
import { z } from "zod";
import { prisma } from "../app";
import { TransferStatus } from "@prisma/client";

const router = Router();

const createTransferSchema = z.object({
  sourceWarehouseId: z.string().uuid(),
  destinationWarehouseId: z.string().uuid(),
  quantity: z.number().int().positive().max(1_000_000),
  notes: z.string().trim().max(500).optional()
}).refine(
  (data) => data.sourceWarehouseId !== data.destinationWarehouseId,
  { message: "Source and destination warehouses must be different." }
);

const statusSchema = z.object({
  status: z.nativeEnum(TransferStatus)
});

router.get("/", async (req, res, next) => {
  try {
    const status = req.query.status
      ? z.nativeEnum(TransferStatus).parse(req.query.status)
      : undefined;

    const search = typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";

    const transfers = await prisma.transfer.findMany({
      where: {
        status,
        ...(search ? {
          OR: [
            { notes: { contains: search, mode: "insensitive" } },
            { sourceWarehouse: { name: { contains: search, mode: "insensitive" } } },
            { destinationWarehouse: { name: { contains: search, mode: "insensitive" } } }
          ]
        } : {})
      },
      include: {
        sourceWarehouse: { select: { id: true, name: true, location: true } },
        destinationWarehouse: { select: { id: true, name: true, location: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(transfers);
  } catch (error) {
    next(error);
  }
});

router.get("/summary/stats", async (_req, res, next) => {
  try {
    const [warehouseCount, totalStock, pending, approved, completed, cancelled] =
      await Promise.all([
        prisma.warehouse.count(),
        prisma.warehouse.aggregate({ _sum: { stock: true } }),
        prisma.transfer.count({ where: { status: "PENDING" } }),
        prisma.transfer.count({ where: { status: "APPROVED" } }),
        prisma.transfer.count({ where: { status: "COMPLETED" } }),
        prisma.transfer.count({ where: { status: "CANCELLED" } })
      ]);

    res.json({
      warehouseCount,
      totalStock: totalStock._sum.stock ?? 0,
      transfers: { pending, approved, completed, cancelled }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const input = createTransferSchema.parse(req.body);

    const [source, destination] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: input.sourceWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: input.destinationWarehouseId } })
    ]);

    if (!source || !destination) {
      throw new Error("Warehouse not found.");
    }

    const transfer = await prisma.transfer.create({
      data: {
        sourceWarehouseId: input.sourceWarehouseId,
        destinationWarehouseId: input.destinationWarehouseId,
        quantity: input.quantity,
        notes: input.notes || null
      },
      include: {
        sourceWarehouse: true,
        destinationWarehouse: true
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status: requestedStatus } = statusSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const transferRows = await tx.$queryRaw<Array<{
        id: string;
        sourceWarehouseId: string;
        destinationWarehouseId: string;
        quantity: number;
        status: TransferStatus;
      }>>`
        SELECT "id", "sourceWarehouseId", "destinationWarehouseId", "quantity", "status"
        FROM "Transfer"
        WHERE "id" = ${req.params.id}
        FOR UPDATE
      `;

      const transfer = transferRows[0];
      if (!transfer) throw new Error("Transfer not found.");

      if (requestedStatus === "APPROVED") {
        if (transfer.status !== "PENDING") {
          throw new Error("Only PENDING transfers can be approved.");
        }

        return tx.transfer.update({
          where: { id: transfer.id },
          data: { status: "APPROVED" },
          include: { sourceWarehouse: true, destinationWarehouse: true }
        });
      }

      if (requestedStatus === "CANCELLED") {
        if (!["PENDING", "APPROVED"].includes(transfer.status)) {
          throw new Error("Only PENDING or APPROVED transfers can be cancelled.");
        }

        return tx.transfer.update({
          where: { id: transfer.id },
          data: { status: "CANCELLED" },
          include: { sourceWarehouse: true, destinationWarehouse: true }
        });
      }

      if (requestedStatus === "COMPLETED") {
        if (transfer.status !== "APPROVED") {
          throw new Error("Only APPROVED transfers can be completed.");
        }

        const warehouseIds = [
          transfer.sourceWarehouseId,
          transfer.destinationWarehouseId
        ].sort();

        // Lock both warehouses in deterministic order to reduce deadlock risk.
        await tx.$queryRaw`
          SELECT "id"
          FROM "Warehouse"
          WHERE "id" IN (${warehouseIds[0]}, ${warehouseIds[1]})
          ORDER BY "id"
          FOR UPDATE
        `;

        const source = await tx.warehouse.findUnique({
          where: { id: transfer.sourceWarehouseId }
        });

        if (!source) throw new Error("Warehouse not found.");
        if (source.stock < transfer.quantity) {
          throw new Error("Source warehouse does not have enough stock.");
        }

        await tx.warehouse.update({
          where: { id: transfer.sourceWarehouseId },
          data: { stock: { decrement: transfer.quantity } }
        });

        await tx.warehouse.update({
          where: { id: transfer.destinationWarehouseId },
          data: { stock: { increment: transfer.quantity } }
        });

        return tx.transfer.update({
          where: { id: transfer.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date()
          },
          include: { sourceWarehouse: true, destinationWarehouse: true }
        });
      }

      if (requestedStatus === "PENDING") {
        throw new Error("A transfer cannot be moved back to PENDING.");
      }

      throw new Error("Unsupported transfer status change.");
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

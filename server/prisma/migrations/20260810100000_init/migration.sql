CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "sourceWarehouseId" TEXT NOT NULL,
    "destinationWarehouseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");
CREATE INDEX "Warehouse_location_idx" ON "Warehouse"("location");
CREATE INDEX "Transfer_status_idx" ON "Transfer"("status");
CREATE INDEX "Transfer_createdAt_idx" ON "Transfer"("createdAt");
CREATE INDEX "Transfer_sourceWarehouseId_idx" ON "Transfer"("sourceWarehouseId");
CREATE INDEX "Transfer_destinationWarehouseId_idx" ON "Transfer"("destinationWarehouseId");

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_sourceWarehouseId_fkey"
FOREIGN KEY ("sourceWarehouseId") REFERENCES "Warehouse"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_destinationWarehouseId_fkey"
FOREIGN KEY ("destinationWarehouseId") REFERENCES "Warehouse"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Warehouse"
ADD CONSTRAINT "Warehouse_stock_nonnegative"
CHECK ("stock" >= 0);

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_different_warehouses"
CHECK ("sourceWarehouseId" <> "destinationWarehouseId");

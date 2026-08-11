import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const warehouses = [
    { name: "Bangalore Central", location: "Bangalore", stock: 500 },
    { name: "Mysore Warehouse", location: "Mysore", stock: 250 },
    { name: "Hyderabad Warehouse", location: "Hyderabad", stock: 350 }
  ];

  for (const warehouse of warehouses) {
    await prisma.warehouse.upsert({
      where: { name: warehouse.name },
      update: {},
      create: warehouse
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import app, { prisma } from "./app";

const port = Number(process.env.PORT ?? 5000);

const server = app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

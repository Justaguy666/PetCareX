import { PrismaClient } from "@prisma/client";
import getEnv from "../utils/env.util.js";

const databaseUrl = getEnv("DATABASE_URL");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ["query", "error", "warn"],
});

export default prisma;

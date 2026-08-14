import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDatabaseConfig(): { url?: string } | undefined {
  const dbUrl = process.env.DATABASE_URL;

  // If using PostgreSQL / MySQL / Supabase / Neon connection
  if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://") || dbUrl.startsWith("mysql://"))) {
    return { url: dbUrl };
  }

  // If in Vercel or AWS Lambda serverless environment or production filesystem
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production") {
    const tmpDbPath = "/tmp/dev.db";

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.resolve(process.cwd(), "apps/api/prisma/dev.db"),
        path.resolve(process.cwd(), "prisma/dev.db"),
        path.resolve(__dirname, "../../prisma/dev.db"),
        path.resolve(__dirname, "../../../prisma/dev.db"),
        path.resolve(__dirname, "../prisma/dev.db"),
        path.resolve(__dirname, "./dev.db")
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (err) {
            console.error(`[Prisma] Failed to copy database from ${candidate}:`, err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
      return { url: `file:${tmpDbPath}` };
    }
  }

  return undefined;
}

const dbConfig = getDatabaseConfig();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: dbConfig?.url ? { db: { url: dbConfig.url } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}


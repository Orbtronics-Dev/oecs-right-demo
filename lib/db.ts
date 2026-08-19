import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

// Persist the database file alongside the source so it survives restarts.
const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "consumer-protection.db");

// Re-use the same connection across hot reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var __database: ReturnType<typeof drizzle> | undefined;
}

function createDatabase(): ReturnType<typeof drizzle> {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const database = globalThis.__database ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalThis.__database = database;
}

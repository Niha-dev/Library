// // Database connection for local development
// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import Database from 'better-sqlite3';
// import * as schema from "@shared/schema";

// // For local development, use SQLite
// const sqlite = new Database('local.db');
// export const db = drizzle(sqlite, schema);

// // Export a simple pool-like object for compatibility
// export const pool = {
//   query: (text: string, params?: any[]) => {
//     return new Promise((resolve) => {
//       const stmt = sqlite.prepare(text);
//       const result = stmt.all(params || []);
//       resolve({ rows: result });
//     });
//   }
// };

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

console.log("Local DB");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",  // 👈 adjust if your schema file is elsewhere
  out: "./drizzle",                 // migrations folder
  dialect: "postgresql",            // 👈 use 'postgresql' not 'pg'
  dbCredentials: {
    url: process.env.DATABASE_URL!, // 👈 use 'url', not 'connectionString'
  },
});

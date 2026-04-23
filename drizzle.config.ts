import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local first, then .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands. Create .env.local file from .env.local.example");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});

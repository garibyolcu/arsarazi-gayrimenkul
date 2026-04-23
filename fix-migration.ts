
import { getDb } from "./api/queries/connection";
import { sql } from "drizzle-orm";

async function migrate() {
  const db = getDb();
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN union_id VARCHAR(255) UNIQUE AFTER id`);
    console.log("Added union_id");
  } catch (e: any) {
    console.log("union_id error (may already exist):", e.message);
  }
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN last_sign_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER updated_at`);
    console.log("Added last_sign_in_at");
  } catch (e: any) {
    console.log("last_sign_in_at error (may already exist):", e.message);
  }
  process.exit(0);
}

migrate();

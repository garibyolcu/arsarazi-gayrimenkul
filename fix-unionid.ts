
import { getDb } from "./api/queries/connection";
import { sql } from "drizzle-orm";

async function fix() {
  const db = getDb();
  try {
    await db.execute(sql.raw("ALTER TABLE users ADD COLUMN union_id VARCHAR(255) UNIQUE AFTER id"));
    console.log("union_id added successfully");
  } catch (e: any) {
    console.log("union_id error:", e.message);
  }
  process.exit(0);
}

fix();

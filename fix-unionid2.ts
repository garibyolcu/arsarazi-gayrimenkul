
import { getDb } from "./api/queries/connection";
import { sql } from "drizzle-orm";

async function fix() {
  const db = getDb();
  try {
    await db.execute(sql.raw("ALTER TABLE users ADD COLUMN union_id VARCHAR(255)"));
    console.log("union_id added (no unique yet)");
  } catch (e: any) {
    console.log("union_id add error:", e.message);
  }
  try {
    await db.execute(sql.raw("ALTER TABLE users ADD UNIQUE INDEX users_union_id_unique (union_id)"));
    console.log("unique index added");
  } catch (e: any) {
    console.log("unique index error:", e.message);
  }
  process.exit(0);
}

fix();

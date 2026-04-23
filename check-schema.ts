
import { getDb } from "./api/queries/connection";
import { sql } from "drizzle-orm";

async function check() {
  const db = getDb();
  try {
    const columns = await db.execute(sql.raw("SHOW COLUMNS FROM users"));
    console.log("USERS COLUMNS:", JSON.stringify(columns, null, 2));
  } catch (e: any) {
    console.log("ERROR:", e.message);
  }
  try {
    const columns2 = await db.execute(sql.raw("SHOW COLUMNS FROM properties"));
    console.log("PROPERTIES COLUMNS:", JSON.stringify(columns2, null, 2));
  } catch (e: any) {
    console.log("ERROR2:", e.message);
  }
  process.exit(0);
}

check();

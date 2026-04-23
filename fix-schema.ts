
import { getDb } from "./api/queries/connection";
import { sql } from "drizzle-orm";

async function fixSchema() {
  const db = getDb();

  const statements = [
    // users table fixes
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS union_id VARCHAR(255) UNIQUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",

    // properties unique constraint
    "ALTER TABLE properties ADD UNIQUE INDEX properties_slug_unique (slug)",

    // users unique constraints
    "ALTER TABLE users ADD UNIQUE INDEX users_email_unique (email)",

    // Ensure boolean defaults are correct
    "ALTER TABLE properties ALTER COLUMN has_parking SET DEFAULT false",
    "ALTER TABLE properties ALTER COLUMN has_garden SET DEFAULT false",
    "ALTER TABLE properties ALTER COLUMN has_elevator SET DEFAULT false",
    "ALTER TABLE properties ALTER COLUMN has_furnished SET DEFAULT false",
  ];

  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(stmt));
      console.log("OK:", stmt.substring(0, 60));
    } catch (e: any) {
      console.log("SKIP:", stmt.substring(0, 60), "-", e.message.substring(0, 80));
    }
  }

  process.exit(0);
}

fixSchema();

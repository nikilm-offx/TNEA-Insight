// Blueprint: javascript_database integration
//
// This file wires the app to a real PostgreSQL database via Drizzle ORM.
// When DATABASE_URL is not set, we fall back to a lightweight NO-DB mock
// so the demo UI still works.

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pkg;

let db: any;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not set. Running in NO-DB mode (mock DB client).");
  db = {
    // Minimal mock so code that calls db.select()/db.insert() in NO-DB mode
    // will fail fast or be guarded by NO_DB flags in storage.ts.
    query: async () => {
      console.log("Mock DB query called (NO-DB mode).");
      return [];
    },
  };
} else {
  // IMPORTANT: If your password contains special characters like '@',
  // be sure to URL-encode them in DATABASE_URL, e.g.
  //   postgresql://postgres:Nikil%402005@localhost:5432/tnea
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
  });

  db = drizzle(pool, {
    schema,
  });
}

export { db };


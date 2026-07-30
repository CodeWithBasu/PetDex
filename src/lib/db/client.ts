import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/petdex";

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
export { schema };


import dotenv from 'dotenv';
dotenv.config();

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use NEON_DATABASE_URL for production and DATABASE_URL for development
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string not found. Set either NEON_DATABASE_URL or DATABASE_URL environment variable.",
  );
}

export const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema });


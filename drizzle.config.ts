import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default {
  schema: "./src/db/schema.ts",
  dbCredentials: {
    uri: process.env.DATABASE_URL as string, // Ensure that DATABASE_URL is defined in .env.local
    database: "musephoria-db", // You can also make this an environment variable if needed
  },
  driver: "mysql2",
} satisfies Config;

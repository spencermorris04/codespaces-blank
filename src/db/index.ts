import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import "dotenv/config";

const connection = connect({
  url: process.env.DATABASE_URL,
});

const db = drizzle(connection);

export { db };
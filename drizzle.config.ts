import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/db/schema.ts",
  dbCredentials: {
    uri: 'mysql://92p572p3fc5vkcj3t56v:pscale_pw_OuT7uXUr1NpD1cjAh7vIvT2wfPmfB6EmzaKQn8vvbkg@aws.connect.psdb.cloud/musephoria-db?ssl={"rejectUnauthorized":true}',
    database: "musephoria-db",
  },
  driver: "mysql2",
} satisfies Config;
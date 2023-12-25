import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/db/schema.ts",
  dbCredentials: {
    uri: 'mysql://l3o9nd237jt32qc8cewl:pscale_pw_Bea0ajbTm7t1r5gBIPv7SrmKf6379l7uYoGGH3DbPte@aws.connect.psdb.cloud/musephoria-db?ssl={"rejectUnauthorized":true}',
    database: "musephoria-db",
  },
  driver: "mysql2",
} satisfies Config;
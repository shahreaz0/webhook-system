import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();
  console.log("Connected successfully");
  const res = await client.query("SELECT NOW()");
  console.log("Result:", res.rows[0]);
  await client.end();
} catch (err) {
  console.error("Connection error:", err);
}

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

// sql เป็นทั้ง tagged-template และมี .query(text, params)
export const sql = neon(url);

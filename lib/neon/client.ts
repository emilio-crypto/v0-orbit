import { neon } from "@neondatabase/serverless"

export function getNeonClient() {
  const sql = neon(process.env.NEON_DATABASE_URL!)
  return sql
}

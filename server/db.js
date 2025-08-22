const { Pool } = require("pg");
require("dotenv").config();

// Use DATABASE_URL from .env (Supabase), otherwise fallback to local dev DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://lance:1234@localhost:5432/notes_test",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Supabase needs SSL
});

module.exports = pool;

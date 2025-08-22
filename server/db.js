const { Pool } = require("pg");

// Load .env variables **only in development**
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Use DATABASE_URL from environment (Render) or fallback to local dev DB
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://lance:1234@localhost:5432/notes_test",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;

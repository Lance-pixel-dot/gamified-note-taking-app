const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all achievements
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM achievements ORDER BY achievement_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching achievements:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
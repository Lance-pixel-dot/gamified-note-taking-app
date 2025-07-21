const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all achievements with unlocked status for a user
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        a.achievement_id,
        a.name,
        a.description,
        a.type,
        a.xp_reward,
        ua.user_id IS NOT NULL AS unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua 
        ON a.achievement_id = ua.achievement_id AND ua.user_id = $1
      ORDER BY a.achievement_id
      `,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching achievements with unlocked status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

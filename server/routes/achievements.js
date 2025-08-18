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
      ORDER BY 
        CASE a.type
          WHEN 'note' THEN 1
          WHEN 'flashcard' THEN 2
          WHEN 'lvl' THEN 3
          WHEN 'streak' THEN 4
          WHEN 'share' THEN 5
          ELSE 6
        END,
        a.achievement_id
      `,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching achievements with unlocked status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if user has unlocked "Help a Friend" achievement (achievement_id = 15)
router.get("/has-helped-friend", async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = 15`,
      [user_id]
    );

    if (result.rows.length > 0) {
      res.json({ hasAchievement: true });
    } else {
      res.json({ hasAchievement: false });
    }
  } catch (err) {
    console.error("Error checking 'Help a Friend' achievement:", err.message);
    res.status(500).json({ error: "Failed to check achievement" });
  }
});

// Unlock an achievement for a user
router.post("/unlock", async (req, res) => {
  const { user_id, achievement_id } = req.body;

  try {
    // Check if the achievement already exists
    const check = await pool.query(
      `SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2`,
      [user_id, achievement_id]
    );

    if (check.rows.length === 0) {
      // Insert new row to unlock the achievement
      await pool.query(
        `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)`,
        [user_id, achievement_id]
      );
    }

    res.status(200).json({ message: "Achievement unlocked" });
  } catch (err) {
    console.error("Error unlocking achievement:", err.message);
    res.status(500).json({ error: "Failed to unlock achievement" });
  }
});

// Check if user has unlocked a specific achievement
router.get("/has", async (req, res) => {
  const { user_id, achievement_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2",
      [user_id, achievement_id]
    );

    res.json({ hasAchievement: result.rows.length > 0 });
  } catch (err) {
    console.error("Error checking achievement:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

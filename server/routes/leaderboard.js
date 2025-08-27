const express = require("express");
const router = express.Router();
const pool = require("../db");

// Leaderboard by XP
router.get("/xp", async (req, res) => {
  try {
    const leaderboard = await pool.query(
      `SELECT user_id, username, xp, level, streak_count, coins
       FROM users
       ORDER BY xp DESC, level DESC
       LIMIT 20`
    );
    res.json(leaderboard.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Leaderboard by Streak
router.get("/streaks", async (req, res) => {
  try {
    const leaderboard = await pool.query(
      `SELECT user_id, username, streak_count, xp, level
       FROM users
       ORDER BY streak_count DESC, xp DESC
       LIMIT 20`
    );
    res.json(leaderboard.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Leaderboard by Coins
router.get("/coins", async (req, res) => {
  try {
    const leaderboard = await pool.query(
      `SELECT user_id, username, coins, xp, level
       FROM users
       ORDER BY coins DESC, xp DESC
       LIMIT 20`
    );
    res.json(leaderboard.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Leaderboard by Level (with stats)
router.get("/level", async (req, res) => {
  try {
    const leaderboard = await pool.query(
      `
      SELECT 
        u.user_id,
        u.username,
        u.level,
        u.xp,
        u.streak_count,
        COALESCE(COUNT(DISTINCT rn.note_id), 0) AS total_read_notes,
        COALESCE(trf.total_reviewed_flashcards, 0) AS total_reviewed_flashcards,
        COALESCE(COUNT(DISTINCT ua.achievement_id), 0) AS total_achievements
      FROM users u
      LEFT JOIN read_notes rn ON u.user_id = rn.user_id
      LEFT JOIN total_reviewed_flashcards trf ON u.user_id = trf.user_id
      LEFT JOIN user_achievements ua ON u.user_id = ua.user_id
      GROUP BY u.user_id, trf.total_reviewed_flashcards
      ORDER BY u.level DESC, u.xp DESC
      LIMIT 20;
      `
    );
    res.json(leaderboard.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

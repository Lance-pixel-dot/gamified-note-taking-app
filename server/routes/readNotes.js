const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get('/can-read-note', async (req, res) => {
  const { user_id, note_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT last_read_date FROM read_notes
       WHERE user_id = $1 AND note_id = $2`,
      [user_id, note_id]
    );

    const today = new Date().toDateString();

    if (result.rows.length === 0) {
      return res.json({ canRead: true });
    }

    const lastRead = new Date(result.rows[0].last_read_date);
    const sameDay = lastRead.toDateString() === today;

    return res.json({ canRead: !sameDay });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/mark-read", async (req, res) => {
  const { user_id, note_id } = req.body;
  const now = new Date();

  try {
    // Insert or update last_read_date
    const existing = await pool.query(
      `SELECT * FROM read_notes
       WHERE user_id = $1 AND note_id = $2`,
      [user_id, note_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE read_notes
         SET last_read_date = $1
         WHERE user_id = $2 AND note_id = $3`,
        [now, user_id, note_id]
      );
    } else {
      await pool.query(
        `INSERT INTO read_notes (user_id, note_id, last_read_date)
         VALUES ($1, $2, $3)`,
        [user_id, note_id, now]
      );
    }

    // Count how many distinct notes the user has read
    const readCountRes = await pool.query(
      `SELECT COUNT(*) FROM read_notes WHERE user_id = $1`,
      [user_id]
    );
    const readCount = parseInt(readCountRes.rows[0].count);

    // Reading achievements
    const readingAchievements = [
      { id: 11, count: 1 },   
      { id: 13, count: 10 },  // 10
      { id: 14, count: 50 }   // 50
    ];

    // Track newly unlocked achievements
    const newlyUnlocked = [];

    for (const { id, count } of readingAchievements) {
      const check = await pool.query(
        `SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2`,
        [user_id, id]
      );

      if (readCount >= count && check.rows.length === 0) {
        await pool.query(
          `INSERT INTO user_achievements (user_id, achievement_id)
           VALUES ($1, $2)`,
          [user_id, id]
        );
        newlyUnlocked.push(id);
      }
    }

    res.json({
      message: "Note marked as read.",
      newAchievements: newlyUnlocked
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;

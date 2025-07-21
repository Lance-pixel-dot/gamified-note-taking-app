const express = require("express");
const router = express.Router();
const pool = require("../db");

// Check if user can review flashcard today
router.get("/can-review", async (req, res) => {
    const { user_id, flashcard_id } = req.query;

    try {
        const result = await pool.query(
            `SELECT last_review_date FROM review_flashcards
             WHERE user_id = $1 AND flashcard_id = $2`,
            [user_id, flashcard_id]
        );

        const today = new Date().toDateString();

        if (result.rows.length === 0) {
            return res.json({ canReview: true, last_review_date: null });
        }

        const lastReview = new Date(result.rows[0].last_review_date);
        const sameDay = lastReview.toDateString() === today;

        return res.json({
            canReview: !sameDay,
            last_review_date: result.rows[0].last_review_date,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Mark flashcard as reviewed and unlock review-based achievements
router.post("/mark-reviewed", async (req, res) => {
  const { user_id, flashcard_id } = req.body;
  const now = new Date();

  try {
    const existing = await pool.query(
      `SELECT * FROM review_flashcards
       WHERE user_id = $1 AND flashcard_id = $2`,
      [user_id, flashcard_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE review_flashcards
         SET last_review_date = $1
         WHERE user_id = $2 AND flashcard_id = $3`,
        [now, user_id, flashcard_id]
      );
    } else {
      await pool.query(
        `INSERT INTO review_flashcards (user_id, flashcard_id, last_review_date)
         VALUES ($1, $2, $3)`,
        [user_id, flashcard_id, now]
      );
    }

    //  Count how many distinct flashcards the user has reviewed
    const reviewedCountRes = await pool.query(
      `SELECT COUNT(*) FROM review_flashcards WHERE user_id = $1`,
      [user_id]
    );
    const reviewedCount = parseInt(reviewedCountRes.rows[0].count);

    //  Review Achievements
    const reviewAchievements = [
      { id: 8, count: 1 },    
      { id: 9, count: 50 },  //50
      { id: 4, count: 200 },  //200
    ];

    for (const { id, count } of reviewAchievements) {
      if (reviewedCount >= count) {
        const check = await pool.query(
          `SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2`,
          [user_id, id]
        );

        if (check.rows.length === 0) {
          await pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id)
             VALUES ($1, $2)`,
            [user_id, id]
          );
        }
      }
    }

    res.send("Flashcard marked as reviewed.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;

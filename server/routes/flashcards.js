const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a flashcard and check for flashcard-based achievements
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, title, question, answer, tag } = req.body;

    await client.query("BEGIN");

    // 1. Create flashcard
    const newFlashcard = await client.query(
      "INSERT INTO flashcards (user_id, title, question, answer, tag) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, title, question, answer, tag]
    );

    // 2. Count total flashcards for user
    const countRes = await client.query(
      "SELECT COUNT(*) FROM flashcards WHERE user_id = $1",
      [user_id]
    );
    const flashcardCount = parseInt(countRes.rows[0].count);

    // 3. Define achievement milestones
    const achievementMilestones = [
      { id: 6, count: 1 },   
      { id: 7, count: 50 }   // 50
    ];

    // 4. Get already unlocked achievements
    const achievedRes = await client.query(
      "SELECT achievement_id FROM user_achievements WHERE user_id = $1",
      [user_id]
    );
    const alreadyUnlocked = achievedRes.rows.map(row => row.achievement_id);

    // 5. Unlock new achievements
    const newlyUnlocked = [];

    for (const { id, count } of achievementMilestones) {
      if (flashcardCount >= count && !alreadyUnlocked.includes(id)) {
        await client.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)",
          [user_id, id]
        );
        newlyUnlocked.push(id);
      }
    }

    await client.query("COMMIT");

    res.json({
      flashcard: newFlashcard.rows[0],
      newAchievements: newlyUnlocked
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating flashcard:", err.message);
    res.status(500).json({ error: "Failed to create flashcard" });
  } finally {
    client.release();
  }
});

// Get all flashcards
router.get("/", async (req, res) => {
  try {
    const allFlashcards = await pool.query("SELECT * FROM flashcards");
    res.json(allFlashcards.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Get flashcards for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userFlashcards = await pool.query(
      "SELECT * FROM flashcards WHERE user_id = $1",
      [userId]
    );
    res.json(userFlashcards.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch user notes" });
  }
});

// Get a flashcard
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const flashcard = await pool.query(
      "SELECT * FROM flashcards WHERE flashcard_id = $1",
      [id]
    );
    res.json(flashcard.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Update a flashcard
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, question, answer, tag } = req.body;
    
    const updatedFlashcard = await pool.query(
      "UPDATE flashcards SET title = $1, question = $2, answer = $3, tag = $4 WHERE flashcard_id = $5 RETURNING *",
      [title, question, answer, tag, id]
    );

    res.json(updatedFlashcard.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Delete a flashcard
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
     await pool.query("DELETE FROM review_flashcards WHERE flashcard_id = $1", [id]);
    await pool.query("DELETE FROM shared_flashcards WHERE flashcard_id = $1", [id]);
    await pool.query("DELETE FROM flashcards WHERE flashcard_id = $1", [id]);
    res.json("Flashcard deleted.");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a flashcard
router.post("/", async (req, res) => {
  try {
    const { user_id, title, question, answer, tag } = req.body;
    const newFlashcard = await pool.query(
      "INSERT INTO flashcards (user_id, title, question, answer, tag) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, title, question, answer, tag]
    );
    res.json(newFlashcard.rows[0]);
  } catch (err) {
    console.error(err.message);
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

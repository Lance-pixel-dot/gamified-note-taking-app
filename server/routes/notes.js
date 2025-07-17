const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a note
router.post("/", async (req, res) => {
  try {
    const { user_id, title, content, tag } = req.body;
    const newNote = await pool.query(
      "INSERT INTO notes (user_id, title, content, tag) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, content, tag]
    );
    res.json(newNote.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Get all notes
router.get("/", async (req, res) => {
  try {
    const allNotes = await pool.query("SELECT * FROM notes");
    res.json(allNotes.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Get notes for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userNotes = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1",
      [userId]
    );
    res.json(userNotes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch user notes" });
  }
});

// Get a note
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await pool.query("SELECT * FROM notes WHERE note_id = $1", [id]);
    res.json(note.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Update a note
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tag } = req.body;
    const updatedNote = await pool.query(
      "UPDATE notes SET title = $1, content = $2, tag = $3 WHERE note_id = $4 RETURNING *",
      [title, content, tag, id]
    );
    res.json(updatedNote.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM read_notes WHERE note_id = $1", [id]);
    await pool.query("DELETE FROM shared_notes WHERE note_id = $1", [id]);
    await pool.query("DELETE FROM notes WHERE note_id = $1", [id]);
    res.json("Note deleted.");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;

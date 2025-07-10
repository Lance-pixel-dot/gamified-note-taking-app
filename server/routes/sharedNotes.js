const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a shared note
router.post("/", async (req, res) => {
  try {
    const { note_id, shared_user_id } = req.body;
    const newSharedNote = await pool.query(
      "INSERT INTO shared_notes (note_id, shared_user_id) VALUES ($1, $2) RETURNING *",
      [note_id, shared_user_id]
    );
    res.json(newSharedNote.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
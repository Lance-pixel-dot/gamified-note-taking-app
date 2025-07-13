const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a shared note
router.post("/", async (req, res) => {
  try {
    const { note_id, shared_user_id } = req.body;

    // Prevent duplicate sharing
    const exists = await pool.query(
      "SELECT * FROM shared_notes WHERE note_id = $1 AND shared_user_id = $2",
      [note_id, shared_user_id]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Note already shared with this user." });
    }

    const newSharedNote = await pool.query(
      "INSERT INTO shared_notes (note_id, shared_user_id) VALUES ($1, $2) RETURNING *",
      [note_id, shared_user_id]
    );
    res.json(newSharedNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to share note." });
  }
});

// Unshare a note with a user
router.delete("/", async (req, res) => {
  try {
    const { note_id, shared_user_id } = req.body;

    const result = await pool.query(
      "DELETE FROM shared_notes WHERE note_id = $1 AND shared_user_id = $2",
      [note_id, shared_user_id]
    );

    res.json({ message: "Note unshared successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to unshare note" });
  }
});

// GET all notes shared *with* a specific user, including owner info
router.get("/with_me/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const sharedNotes = await pool.query(
      `SELECT n.*, u.username AS owner_username
       FROM shared_notes sn
       JOIN notes n ON sn.note_id = n.note_id
       JOIN users u ON n.user_id = u.user_id
       WHERE sn.shared_user_id = $1`,
      [user_id]
    );

    res.json(sharedNotes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch shared notes." });
  }
});

// Get notes the current user shared with others
router.get("/shared/by_me/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const sharedNotes = await pool.query(`
      SELECT DISTINCT n.*, u.username AS owner_username
      FROM shared_notes sn
      JOIN notes n ON sn.note_id = n.note_id
      JOIN users u ON n.user_id = u.user_id
      WHERE n.user_id = $1
    `, [user_id]);

    res.json(sharedNotes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch notes shared by user." });
  }
});

// Get users a note is shared with
router.get("/:note_id", async (req, res) => {
  try {
    const { note_id } = req.params;
    const sharedUsers = await pool.query(
      "SELECT shared_user_id FROM shared_notes WHERE note_id = $1",
      [note_id]
    );
    res.json(sharedUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch shared users" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create or update a shared flashcard with permission
router.post("/", async (req, res) => {
  try {
    const { flashcard_id, shared_user_id, permission = "view" } = req.body;

    const validPermissions = ["view", "edit"];
    if (!validPermissions.includes(permission)) {
      return res.status(400).json({ error: "Invalid permission value" });
    }

    const sharedFlashcard = await pool.query(
      `
      INSERT INTO shared_flashcards (flashcard_id, shared_user_id, permission)
      VALUES ($1, $2, $3)
      ON CONFLICT (flashcard_id, shared_user_id)
      DO UPDATE SET permission = EXCLUDED.permission
      RETURNING *
      `,
      [flashcard_id, shared_user_id, permission]
    );

    res.json(sharedNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to share flashcard." });
  }
});

// Unshare a flashcard with a user
router.delete("/", async (req, res) => {
  try {
    const { flashcard_id, shared_user_id } = req.body;

    const result = await pool.query(
      "DELETE FROM shared_flashcards WHERE flashcard_id = $1 AND shared_user_id = $2",
      [flashcard_id, shared_user_id]
    );

    res.json({ message: "Flashcard unshared successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to unshare flashcard" });
  }
});

// Get flashcards shared *with* a user (include permission + owner info)
router.get("/with_me/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const sharedFlashcards = await pool.query(
      `SELECT n.*, u.username AS owner_username, sn.permission
       FROM shared_flashcards sn
       JOIN flashcards n ON sn.flashcard_id = n.flashcard_id
       JOIN users u ON n.user_id = u.user_id
       WHERE sn.shared_user_id = $1`,
      [user_id]
    );

    res.json(sharedFlashcards.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch shared flashcards." });
  }
});

// Get flashcards the current user shared with others (includes permission)
router.get("/shared/by_me/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const sharedFlashcards = await pool.query(
      `SELECT n.*, sn.shared_user_id, sn.permission
       FROM shared_flashcards sn
       JOIN notes n ON sn.note_id = n.note_id
       WHERE n.user_id = $1`,
      [user_id]
    );

    res.json(sharedNotes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch notes shared by user." });
  }
});

// Get users a note is shared with (include permission)
router.get("/:note_id", async (req, res) => {
  try {
    const { note_id } = req.params;

    const sharedUsers = await pool.query(
      `SELECT u.user_id AS shared_user_id, u.username, sn.permission
       FROM shared_notes sn
       JOIN users u ON sn.shared_user_id = u.user_id
       WHERE sn.note_id = $1`,
      [note_id]
    );

    res.json(sharedUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch shared users" });
  }
});

module.exports = router;
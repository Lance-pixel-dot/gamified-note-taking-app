const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create or update a shared note with permission
router.post("/", async (req, res) => {
  try {
    const { note_id, shared_user_id, permission = "view" } = req.body;

    const validPermissions = ["view", "edit"];
    if (!validPermissions.includes(permission)) {
      return res.status(400).json({ error: "Invalid permission value" });
    }

    const sharedNote = await pool.query(
      `
      INSERT INTO shared_notes (note_id, shared_user_id, permission)
      VALUES ($1, $2, $3)
      ON CONFLICT (note_id, shared_user_id)
      DO UPDATE SET permission = EXCLUDED.permission
      RETURNING *
      `,
      [note_id, shared_user_id, permission]
    );

    res.json(sharedNote.rows[0]);
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

// Get notes shared *with* a user (include permission + owner info)
router.get("/with_me/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const sharedNotes = await pool.query(
      `SELECT n.*, u.username AS owner_username, sn.permission
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

// Get notes the current user shared with others (includes permission)
router.get("/shared/by_me/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const sharedNotes = await pool.query(
      `SELECT n.*, sn.shared_user_id, sn.permission
       FROM shared_notes sn
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

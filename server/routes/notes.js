const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a note and check for achievements
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id, title, content, tag } = req.body;

    await client.query("BEGIN");

    // Insert new note
    const newNote = await client.query(
      "INSERT INTO notes (user_id, title, content, tag) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, content, tag]
    );

    // Count total notes for the user
    const countResult = await client.query(
      "SELECT COUNT(*) FROM notes WHERE user_id = $1",
      [user_id]
    );
    const noteCount = parseInt(countResult.rows[0].count);

    // Milestone-based achievements (for note creation)
    const noteAchievements = [
      { id: 1, count: 1 },   
      { id: 2, count: 10 },   // 10
      { id: 12, count: 50 }   // 50
    ];

    // Get already unlocked achievements
    const achieved = await client.query(
      "SELECT achievement_id FROM user_achievements WHERE user_id = $1",
      [user_id]
    );
    const alreadyAchieved = achieved.rows.map(row => row.achievement_id);

    // Track which achievements were unlocked
    const newlyUnlocked = [];

    for (const achievement of noteAchievements) {
      if (noteCount >= achievement.count && !alreadyAchieved.includes(achievement.id)) {
        await client.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)",
          [user_id, achievement.id]
        );
        newlyUnlocked.push(achievement.id); // Track it
      }
    }

    await client.query("COMMIT");

    // Return only unlocked achievements
    res.json({
      note: newNote.rows[0],
      newAchievements: newlyUnlocked
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating note:", err.message);
    res.status(500).json({ error: "Failed to create note and check achievements." });
  } finally {
    client.release();
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

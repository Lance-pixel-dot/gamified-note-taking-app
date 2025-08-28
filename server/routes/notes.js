const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a note and check for achievements
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id, title, content, tag } = req.body;

    await client.query("BEGIN");

    // 1. Insert new note
    const newNote = await client.query(
      "INSERT INTO notes (user_id, title, content, tag) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, content, tag]
    );

    // 2. Update or insert into created_notes
    const existing = await client.query(
      "SELECT total_notes FROM created_notes WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      await client.query(
        "UPDATE created_notes SET total_notes = total_notes + 1 WHERE user_id = $1",
        [user_id]
      );
    } else {
      await client.query(
        "INSERT INTO created_notes (user_id, total_notes) VALUES ($1, 1)",
        [user_id]
      );
    }

    // 3. Get updated count
    const countResult = await client.query(
      "SELECT total_notes FROM created_notes WHERE user_id = $1",
      [user_id]
    );
    const noteCount = countResult.rows[0].total_notes;

    // 4. Milestone-based achievements
    const noteAchievements = [
      { id: 1, count: 1 },
      { id: 2, count: 10 }, //10
      { id: 12, count: 50 } //50
    ];

    // 5. Get already unlocked achievements
    const achieved = await client.query(
      "SELECT achievement_id FROM user_achievements WHERE user_id = $1",
      [user_id]
    );
    const alreadyAchieved = achieved.rows.map(row => row.achievement_id);

    // 6. Track new ones
    const newlyUnlocked = [];

    for (const achievement of noteAchievements) {
      if (noteCount >= achievement.count && !alreadyAchieved.includes(achievement.id)) {
        await client.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)",
          [user_id, achievement.id]
        );
        newlyUnlocked.push(achievement.id);
      }
    }

    await client.query("COMMIT");

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

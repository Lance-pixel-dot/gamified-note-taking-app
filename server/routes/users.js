const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a user
router.post("/", async (req, res) => {
  try {

    const { username, password } = req.body;

    const userExists = await pool.query("SELECT * FROM users WHERE LOWER(username) = $1", [username.toLowerCase()]);

    if (userExists.rows.length > 0){
      return res.status(409).json({ error: "Username already taken" }); // 409 = Conflict
    }

    const newUser = await pool.query(
      "INSERT INTO users (username, password, xp, level, streak_count, last_active) VALUES ($1, $2, 0, 1, 0, CURRENT_DATE) RETURNING *",
      [username, password]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Display users
router.get("/", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//log in a user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = $1 AND password = $2",
      [username.toLowerCase(), password]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ message: "Login successful", user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

router.put("/:id/xp", async (req, res) => {
  try {
    const { id } = req.params;
    const { xp, level, streak_count, last_active } = req.body;

    const updateXP = await pool.query(
      `UPDATE users
       SET xp = $1, level = $2, streak_count = $3, last_active = $4
       WHERE user_id = $5 RETURNING *`,
      [xp.toFixed(2), level, streak_count, last_active, id]
    );

    res.json(updateXP.rows[0]);
  } catch (err) {
    console.error("Error updating XP and streak:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Corrected XP fetch route
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT xp, level FROM users WHERE user_id = $1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch user XP and level" });
  }
});

router.get("/:id/streak", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT streak_count, last_active FROM users WHERE user_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching streak info:", err.message);
    res.status(500).json({ error: "Failed to fetch streak info" });
  }
});



module.exports = router;
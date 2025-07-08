const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a user
router.post("/", async (req, res) => {
  try {

    const { username, password } = req.body;

    const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (userExists.rows.length > 0){
      return res.status(409).json({ error: "Username already taken" }); // 409 = Conflict
    }

    const newUser = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//log in a user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
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

module.exports = router;
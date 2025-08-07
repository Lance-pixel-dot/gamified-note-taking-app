const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all available themes (for the store)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM themes ORDER BY price ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching themes:", err.message);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
});

// Get themes owned by a user and which one is selected
router.get("/all/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const allThemes = await pool.query("SELECT * FROM themes");
    const userThemes = await pool.query(
      "SELECT theme_id, is_selected FROM user_themes WHERE user_id = $1",
      [userId]
    );

    res.json({
      allThemes: allThemes.rows,
      userThemes: userThemes.rows,
    });
  } catch (err) {
    console.error("Error fetching themes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all themes and mark which ones the user owns
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const allThemes = await pool.query('SELECT * FROM themes');

    const ownedThemes = await pool.query(
      'SELECT theme_id FROM user_themes WHERE user_id = $1',
      [userId]
    );

    const ownedThemeIds = ownedThemes.rows.map(t => t.theme_id);

    const themesWithOwnership = allThemes.rows.map(theme => ({
      ...theme,
      isOwned: ownedThemeIds.includes(theme.id),
    }));

    res.json(themesWithOwnership);
  } catch (err) {
    console.error('Error fetching themes:', err);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// Purchase a theme
router.post("/purchase", async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, themeId } = req.body;

    await client.query("BEGIN");

    // Check if already owned
    const owned = await client.query(
      "SELECT * FROM user_themes WHERE user_id = $1 AND theme_id = $2",
      [userId, themeId]
    );

    if (owned.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Theme already purchased" });
    }

    // Get user coins and theme price
    const [userRes, themeRes] = await Promise.all([
      client.query("SELECT coins FROM users WHERE user_id = $1", [userId]),
      client.query("SELECT price FROM themes WHERE id = $1", [themeId])
    ]);

    if (userRes.rows.length === 0 || themeRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User or theme not found" });
    }

    const userCoins = userRes.rows[0].coins;
    const price = themeRes.rows[0].price;

    if (userCoins < price) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Not enough coins" });
    }

    // Deduct coins
    await client.query(
      "UPDATE users SET coins = coins - $1 WHERE user_id = $2",
      [price, userId]
    );

    // Grant theme
    const newTheme = await client.query(
      "INSERT INTO user_themes (user_id, theme_id, is_selected) VALUES ($1, $2, FALSE) RETURNING *",
      [userId, themeId]
    );

    await client.query("COMMIT");

    res.json({ message: "Theme purchased successfully", theme: newTheme.rows[0] });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error purchasing theme:", err.message);
    res.status(500).json({ error: "Failed to purchase theme" });
  } finally {
    client.release();
  }
});

// Select a theme
router.post("/select", async (req, res) => {
  const { userId, themeId } = req.body;

  try {
    // Check if user owns the theme
    const owned = await pool.query(
      "SELECT * FROM user_themes WHERE user_id = $1 AND theme_id = $2",
      [userId, themeId]
    );

    if (owned.rows.length === 0) {
      return res.status(400).json({ error: "Theme not owned by user" });
    }

    // Unselect all other themes
    await pool.query(
      "UPDATE user_themes SET is_selected = FALSE WHERE user_id = $1",
      [userId]
    );

    // Select the new theme
    await pool.query(
      "UPDATE user_themes SET is_selected = TRUE WHERE user_id = $1 AND theme_id = $2",
      [userId, themeId]
    );

    res.json({ message: "Theme selected successfully" });
  } catch (err) {
    console.error("Error selecting theme:", err.message);
    res.status(500).json({ error: "Failed to select theme" });
  }
});

module.exports = router;

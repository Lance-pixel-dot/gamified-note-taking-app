const express = require("express");
const router = express.Router();
const pool = require("../db");

// Share a flashcard
router.post("/", async (req, res) => {
    const { flashcard_id, shared_user_id, permission } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO shared_flashcards (flashcard_id, shared_user_id, permission)
             VALUES ($1, $2, $3)
             ON CONFLICT (flashcard_id, shared_user_id)
             DO UPDATE SET permission = EXCLUDED.permission
             RETURNING *`,
            [flashcard_id, shared_user_id, permission]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Unshare a flashcard
router.delete("/", async (req, res) => {
    const { flashcard_id, shared_user_id } = req.body;

    try {
        await pool.query(
            "DELETE FROM shared_flashcards WHERE flashcard_id = $1 AND shared_user_id = $2",
            [flashcard_id, shared_user_id]
        );

        res.sendStatus(204);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Get users shared with a specific flashcard
router.get("/:flashcard_id", async (req, res) => {
    const { flashcard_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT u.username, sf.shared_user_id, sf.permission
             FROM shared_flashcards sf
             JOIN users u ON u.user_id = sf.shared_user_id
             WHERE sf.flashcard_id = $1`,
            [flashcard_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Flashcards shared *with* the logged-in user
router.get("/with_me/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT f.*, u.username AS owner_username, sf.permission
             FROM shared_flashcards sf
             JOIN flashcards f ON f.flashcard_id = sf.flashcard_id
             JOIN users u ON u.user_id = f.user_id
             WHERE sf.shared_user_id = $1`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Flashcards shared *by* the logged-in user
router.get("/shared/by_me/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT DISTINCT f.*
             FROM flashcards f
             JOIN shared_flashcards sf ON f.flashcard_id = sf.flashcard_id
             WHERE f.user_id = $1`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;

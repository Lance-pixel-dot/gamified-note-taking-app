const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get('/can-read-note', async (req, res) => {
    const { user_id, note_id } = req.query;

    try {
        const result = await pool.query(
            `SELECT last_read_date FROM read_notes
             WHERE user_id = $1 AND note_id = $2`,
            [user_id, note_id]
        );

        const today = new Date().toDateString();

        if (result.rows.length === 0) {
            return res.json({ canRead: true });
        }

        const lastRead = new Date(result.rows[0].last_read_date);
        const sameDay = lastRead.toDateString() === today;

        return res.json({ canRead: !sameDay });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post('/mark-read', async (req, res) => {
    const { user_id, note_id } = req.body;
    const now = new Date();

    try {
        const existing = await pool.query(
            `SELECT * FROM read_notes
             WHERE user_id = $1 AND note_id = $2`,
            [user_id, note_id]
        );

        if (existing.rows.length > 0) {
            await pool.query(
                `UPDATE read_notes
                 SET last_read_date = $1
                 WHERE user_id = $2 AND note_id = $3`,
                [now, user_id, note_id]
            );
        } else {
            await pool.query(
                `INSERT INTO read_notes (user_id, note_id, last_read_date)
                 VALUES ($1, $2, $3)`,
                [user_id, note_id, now]
            );
        }

        res.send("Note marked as read.");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


module.exports = router;
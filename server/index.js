const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json());

//ROUTES//

//create a note
app.post("/notes", async(req, res) => {
    try{
        const { title, content, tag } = req.body;
        const newNote = await pool.query("INSERT INTO notes (title, content, tag) VALUES($1, $2, $3) RETURNING *", [title, content, tag]);
        
        res.json(newNote.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

//get all notes
app.get("/notes", async(req, res) => {
    try {
        const allNotes = await pool.query("SELECT * FROM notes");
        res.json(allNotes.rows);
    } catch (err) {
        console.error(err.message);
    }
})

//get a note
app.get("/notes/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const todo = await pool.query("SELECT * FROM notes WHERE note_id = $1", [id]);

        res.json(todo.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

//update a note
app.put("/notes/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const updateNote = await pool.query("UPDATE notes SET title = $1 WHERE note_id = $2", [title, id]);

        res.json("This Note was updated :)");
    } catch (err) {
        console.error(err.message);
    }
})

//delete a note
app.delete("/notes/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const deleteNote = await pool.query("DELETE FROM notes WHERE note_id = $1", [id]);

        res.json("This Note was Deleted >:(");
    } catch (err) {
        console.error(err.message);
    }
})

app.listen(5000, () => {
    console.log("server has started in port 5000");
});
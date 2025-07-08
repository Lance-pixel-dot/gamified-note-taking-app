const express = require("express");
const cors = require("cors");
const app = express();
const noteRoutes = require("./routes/notes");
const flashcardRoutes = require("./routes/flashcards");
const userRoutes = require("./routes/users");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);
app.use("/flashcards", flashcardRoutes);

// Start server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});

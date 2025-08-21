const express = require("express");
const cors = require("cors");
const app = express();
const noteRoutes = require("./routes/notes");
const flashcardRoutes = require("./routes/flashcards");
const userRoutes = require("./routes/users");
const sharedNotesRoutes = require("./routes/sharedNotes")
const sharedFlashcardsRoutes = require("./routes/sharedFlashcards");
const readNotesRoutes = require("./routes/readNotes");
const reviewFlashcardsRoutes = require("./routes/reviewFlashcards");
const achievementsRoutes = require("./routes/achievements");
const themeRoutes = require("./routes/themes");
const leaderboardRoutes = require("./routes/leaderboard");


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);
app.use("/flashcards", flashcardRoutes);
app.use("/shared_notes", sharedNotesRoutes);
app.use("/shared_flashcards", sharedFlashcardsRoutes);
app.use("/read_notes", readNotesRoutes);
app.use("/review_flashcards", reviewFlashcardsRoutes);
app.use("/achievements", achievementsRoutes);
app.use("/themes", themeRoutes);
app.use("/leaderboard", leaderboardRoutes);

// Start server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});

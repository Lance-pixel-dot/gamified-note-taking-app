const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); // to load .env variables
dotenv.config();

const app = express();

// Import routes
const noteRoutes = require("./routes/notes");
const flashcardRoutes = require("./routes/flashcards");
const userRoutes = require("./routes/users");
const sharedNotesRoutes = require("./routes/sharedNotes");
const sharedFlashcardsRoutes = require("./routes/sharedFlashcards");
const readNotesRoutes = require("./routes/readNotes");
const reviewFlashcardsRoutes = require("./routes/reviewFlashcards");
const achievementsRoutes = require("./routes/achievements");
const themeRoutes = require("./routes/themes");
const leaderboardRoutes = require("./routes/leaderboard");

// Middleware
const allowedOrigins = [
  "https://mind-keep.onrender.com", // frontend on Render
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

app.options("*", cors());

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

// Test route to check DB connection
const pool = require("./db");
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000; // use PORT from .env
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
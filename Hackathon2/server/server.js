const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test route
app.get("/", (req, res) => {
  res.send("Quiz API is running!");
});

// Get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM questions ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Save score
app.post("/api/scores", async (req, res) => {
  try {
    const { username, score } = req.body;

    if (!username || score === undefined) {
      return res.status(400).json({ error: "Username and score are required" });
    }

    const result = await pool.query(
      "INSERT INTO scores (username, score) VALUES ($1, $2) RETURNING *",
      [username, score]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// Get leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.delete("/api/leaderboard", async (req, res) => {
  try {
    await pool.query("DELETE FROM scores");
    res.json({ message: "Leaderboard cleared successfully" });
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
    res.status(500).json({ error: "Failed to clear leaderboard" });
  }
});

app.post("/api/quiz-history", async (req, res) => {
const { history } = req.body;

try {
for (const item of history) {
await pool.query(
"INSERT INTO quiz_history (username, question, selected_answer, correct_answer, is_correct, time_taken) VALUES ($1, $2, $3, $4, $5, $6)",
[
item.username,
item.question,
item.selected_answer,
item.correct_answer,
item.is_correct,
item.time_taken
]
);
}

res.status(201).json({ message: "Quiz history saved successfully" });
} catch (error) {
console.error("Error saving quiz history:", error);
res.status(500).json({ error: "Failed to save quiz history" });
}
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
console.log("RUNNING NEW FILTERED BACKEND");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-vercel-url.vercel.app"
  ]
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ================= ROUTES ================= */

// Root test
app.get("/", (req, res) => {
  res.send("Test Root Works");
});

// DB test
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ serverTime: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database connection failed");
  }
});

// GET listings with filters
app.get("/listings", async (req, res) => {
  try {
    const { minPrice, maxPrice, city } = req.query;

    let query = "SELECT * FROM listings WHERE 1=1";
    let values = [];

    if (minPrice) {
      values.push(minPrice);
      query += ` AND price >= $${values.length}`;
    }

    if (maxPrice) {
      values.push(maxPrice);
      query += ` AND price <= $${values.length}`;
    }

    if (city) {
      values.push(`%${city}%`);
      query += ` AND city ILIKE $${values.length}`;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE listing
app.post("/listings", async (req, res) => {
  try {
    const { title, price, city } = req.body;

    if (!title || !price || !city)
      return res.status(400).json({ error: "Missing fields" });

    const result = await pool.query(
      "INSERT INTO listings (title, price, city) VALUES ($1,$2,$3) RETURNING *",
      [title, price, city]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error creating listing");
  }
});

/* ================= FAVORITES ================= */

// GET favorites for a user
app.get("/favorites/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(`
      SELECT listings.*
      FROM favorites
      JOIN listings ON listings.id = favorites.listing_id
      WHERE favorites.user_id = $1
    `, [userId]);

    res.json(result.rows);

  } catch (err) {
    console.error("Favorites error:", err.message);
    res.status(500).send("Error fetching favorites");
  }
});


// SAVE favorite
app.post("/favorites", async (req, res) => {
  try {
    const { user_id, listing_id } = req.body;

    const result = await pool.query(
      "INSERT INTO favorites (user_id, listing_id) VALUES ($1,$2) RETURNING *",
      [user_id, listing_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Save favorite error:", err.message);
    res.status(500).send("Error saving favorite");
  }
});


// REMOVE favorite
app.delete("/favorites", async (req, res) => {
  try {
    const { user_id, listing_id } = req.body;

    await pool.query(
      "DELETE FROM favorites WHERE user_id=$1 AND listing_id=$2",
      [user_id, listing_id]
    );

    res.send("Removed from favorites");

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error removing favorite");
  }
});

// ADD RATING
app.post("/ratings", async (req, res) => {
  try {
    const { user_id, listing_id, rating, comment } = req.body;

    const result = await pool.query(
      "INSERT INTO ratings (user_id, listing_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *",
      [user_id, listing_id, rating, comment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error adding rating");
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("listings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity] = useState("");

  const API = "https://finalproject-backend-hqi0.onrender.com";

  // ================= FETCH LISTINGS =================
  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API}/listings`, {
        params: { minPrice, maxPrice, city }
      });
      setListings(res.data);
      setView("listings");
    } catch {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH FAVORITES =================
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/favorites`);
      setFavorites(res.data);
      setView("favorites");
    } catch {
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE FAVORITE =================
  const saveFavorite = async (id) => {
  try {
    await axios.post(`${API}/favorites`, {
      user_id: 1,
      listing_id: id
    });
    alert("Saved ❤️");
  } catch (err) {
    if (err.response?.status === 500) {
      alert("Already saved ❤️");
    } else {
      alert("Server error");
    }
  }
};

  // ================= REMOVE FAVORITE =================
  const removeFavorite = async (id) => {
    try {
      await axios.delete(`${API}/favorites/${id}`);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch {
      alert("Failed to remove favorite");
    }
  };
  // ================= UI =================
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h1>Rental Listings 🇮🇱</h1>

      {/* NAV */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={fetchListings}>🏠 Listings</button>
        <button onClick={fetchFavorites} style={{ marginLeft: 10 }}>
          ❤️ Favorites
        </button>
      </div>

      {/* FILTERS */}
      {view === "listings" && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="number"
            placeholder="Min ₪"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₪"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ marginLeft: 10 }}
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ marginLeft: 10 }}
          />
          <button onClick={fetchListings} style={{ marginLeft: 10 }}>
            Search
          </button>
        </div>
      )}

      {/* STATUS */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LISTINGS */}
      {view === "listings" &&
        listings.map((l) => (
          <Card key={l.id} listing={l} saveFavorite={saveFavorite} />
        ))}

      {/* FAVORITES */}
      {view === "favorites" &&
  favorites.map((l) => (
    <Card
      key={l.id}
      listing={l}
      removeFavorite={removeFavorite}
    />
))}
    </div>
  );
}

// ================= CARD COMPONENT =================
function Card({ listing, saveFavorite, removeFavorite }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: 15,
      marginBottom: 15,
      borderRadius: 8
    }}>
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      <p><b>City:</b> {listing.city}</p>
      <p><b>Price:</b> ₪{listing.price}</p>

      {saveFavorite && (
        <button onClick={() => saveFavorite(listing.id)}>
          ❤️ Save
        </button>
      )}

      {removeFavorite && (
        <button onClick={() => removeFavorite(listing.id)}>
          ❌ Remove
        </button>
      )}
    </div>
  );
}
     
export default App;
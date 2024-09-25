import React, { useEffect, useState } from "react";
import { ref as dbRef, onValue, remove } from "firebase/database";
import { realtimeDb } from "./firebaseDB"; // Firebase Realtime Database
import { auth } from "./firebaseDB"; // Firebase Authentication

const Watchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // State for current user

  // Fetch current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's watchlist
  useEffect(() => {
    if (user) {
      const watchlistRef = dbRef(realtimeDb, `watchlist/${user.uid}`);

      onValue(watchlistRef, (snapshot) => {
        const watchlistData = snapshot.val();
        const items = [];

        if (watchlistData) {
          Object.keys(watchlistData).forEach((itemId) => {
            items.push({
              id: itemId,
              ...watchlistData[itemId],
            });
          });
        }

        setWatchlistItems(items);
        setLoading(false);
      });
    }
  }, [user]);

  // Function to remove an item from the watchlist (without deleting the main item)
  const handleRemoveFromWatchlist = (itemId) => {
    if (user) {
      const itemRef = dbRef(realtimeDb, `watchlist/${user.uid}/${itemId}`);
      remove(itemRef)
        .then(() => {
          alert("Item removed from watchlist");
        })
        .catch(() => {
          alert("Failed to remove item from watchlist");
        });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please log in to view your watchlist.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Watchlist</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {watchlistItems.length === 0 ? (
          <p>Your watchlist is empty.</p>
        ) : (
          watchlistItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                width: "300px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{item.name}</h3>
              <img
                src={item.pic}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <p>
                <strong>Condition:</strong> {item.condition}
              </p>
              <p>
                <strong>Type:</strong> {item.type}
              </p>
              <p>
                <strong>Contact:</strong> {item.email}
              </p>
              <p>
                <strong>Added on:</strong>{" "}
                {new Date(item.timestamp).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleRemoveFromWatchlist(item.id)}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Remove from Watchlist
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Watchlist;

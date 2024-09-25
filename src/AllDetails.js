import React, { useEffect, useState } from "react";
import { ref as dbRef, onValue, set } from "firebase/database";
import { realtimeDb } from "./firebaseDB"; // Import Firebase Realtime Database
import { auth } from "./firebaseDB"; // Import Firebase Auth

const AllDetails = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [noItemsFound, setNoItemsFound] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); // State for current user

  // Fetch current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const itemsRef = dbRef(realtimeDb, "items");

    onValue(itemsRef, (snapshot) => {
      const itemsData = snapshot.val();
      const allItems = [];

      if (itemsData) {
        Object.keys(itemsData).forEach((userId) => {
          const userItems = itemsData[userId];
          Object.keys(userItems).forEach((itemId) => {
            allItems.push({
              id: itemId,
              ...userItems[itemId],
            });
          });
        });

        allItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      setItems(allItems);
      setFilteredItems(allItems);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = items
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((item) =>
        selectedCondition ? item.condition === selectedCondition : true
      );

    setFilteredItems(filtered);
    setNoItemsFound(filtered.length === 0 && searchQuery !== "");
  }, [searchQuery, selectedCondition, items]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Function to add an item to the watchlist
  const handleAddToWatchlist = (item) => {
    if (user) {
      const watchlistRef = dbRef(
        realtimeDb,
        `watchlist/${user.uid}/${item.id}`
      );
      set(watchlistRef, item)
        .then(() => {
          alert(`${item.name} added to watchlist`);
        })
        .catch(() => {
          alert(`Failed to add ${item.name} to watchlist`);
        });
    } else {
      alert("Please log in to add items to your watchlist.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Items</h2>
      <input
        type="text"
        placeholder="Search by item name..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          boxSizing: "border-box",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="conditionFilter" style={{ marginRight: "10px" }}>
          Filter by condition:
        </label>
        <select
          id="conditionFilter"
          value={selectedCondition}
          onChange={handleConditionChange}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="">All Conditions</option>
          <option value="new">New</option>
          <option value="worn-out">Donation</option>
          <option value="damaged">Recycle</option>
        </select>
      </div>
      {noItemsFound && (
        <p style={{ color: "red" }}>
          No items found with the name "{searchQuery}" and the selected
          condition.
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredItems.length === 0 && !noItemsFound ? (
          <p>No items available.</p>
        ) : (
          filteredItems.map((item) => (
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
                  cursor: "pointer", // Indicate that the image is clickable
                }}
                onClick={() => handleImageClick(item.pic)}
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

              {item.condition === "new" && (
                <button
                  onClick={() => handleAddToWatchlist(item)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Add to Watchlist
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Full View" style={styles.modalImage} />
            <button style={styles.modalCloseButton} onClick={closeModal}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    position: "relative",
    maxWidth: "90%",
    maxHeight: "90%",
  },
  modalImage: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
  },
  modalCloseButton: {
    position: "absolute",
    top: "-10px",
    right: "-10px",
    background: "#e74c3c",
    border: "none",
    color: "#fff",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    cursor: "pointer",
    zIndex: 1001,
  },
};

export default AllDetails;

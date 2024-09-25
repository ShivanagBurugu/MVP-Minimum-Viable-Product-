import React, { useState, useEffect } from "react";
import { auth, realtimeDb } from "./firebaseDB"; // Import Firebase services
import { onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, onValue, remove, update } from "firebase/database";

// Modal component for full-screen image view
const Modal = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <img src={imageSrc} alt="Full View" style={styles.modalImage} />
        <button style={styles.modalCloseButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

// Form component for updating item details
const UpdateForm = ({ item, onUpdate, onClose }) => {
  const [name, setName] = useState(item.name);
  const [condition, setCondition] = useState(item.condition);
  const [type, setType] = useState(item.type);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(item.pic);

  const handleUpdate = () => {
    if (!name || !condition || !type) return;

    // Prepare item update data
    const updatedItem = {
      ...item,
      name,
      condition,
      type,
      pic: preview,
    };

    // Call update function
    onUpdate(updatedItem);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  return (
    <div style={styles.updateFormOverlay} onClick={onClose}>
      <div
        style={styles.updateFormContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Update Item</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item Name"
          style={styles.input}
        />
        <input
          type="text"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Condition"
          style={styles.input}
        />
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type"
          style={styles.input}
        />
        <input
          type="file"
          onChange={handleImageChange}
          style={styles.fileInput}
        />
        {preview && (
          <img src={preview} alt="Preview" style={styles.imagePreview} />
        )}
        <button style={styles.updateButton} onClick={handleUpdate}>
          Update
        </button>
        <button style={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const Myitems = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchItems(user.uid); // Fetch items when user is authenticated
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = (userId) => {
    const itemsRef = dbRef(realtimeDb, `items/${userId}`);
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedItems = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        fetchedItems.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        ); // Sort by recent items
        setItems(fetchedItems);
      }
      setLoading(false);
    });
  };

  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const handleUpdate = (updatedItem) => {
    if (user) {
      const itemsRef = dbRef(realtimeDb, `items/${user.uid}/${updatedItem.id}`);
      update(itemsRef, updatedItem)
        .then(() => {
          fetchItems(user.uid); // Refresh items
          setIsUpdateFormOpen(false);
          setUpdateItem(null);
          alert("Item updated successfully.");
        })
        .catch(() => {
          alert("Failed to update item.");
        });
    }
  };

  const handleDelete = (itemId) => {
    if (user) {
      const itemRef = dbRef(realtimeDb, `items/${user.uid}/${itemId}`);
      remove(itemRef)
        .then(() => {
          fetchItems(user.uid); // Refresh items
          alert("Item deleted successfully.");
        })
        .catch(() => {
          alert("Failed to delete item.");
        });
    }
  };

  const openUpdateForm = (item) => {
    setUpdateItem(item);
    setIsUpdateFormOpen(true);
  };

  const closeUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setUpdateItem(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Items</h1>
      <div style={styles.cardsContainer}>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} style={styles.card}>
              <img
                src={item.pic}
                alt={item.name}
                style={styles.image}
                onClick={() => handleImageClick(item.pic)}
              />
              <div style={styles.cardContent}>
                <h2 style={styles.itemName}>{item.name}</h2>
                <p style={styles.itemCondition}>Condition: {item.condition}</p>
                <p style={styles.itemType}>Type: {item.type}</p>
                <p style={styles.itemTimestamp}>
                  Added on: {new Date(item.timestamp).toLocaleDateString()}
                </p>
                <p style={styles.actionSentence}>
                  {item.condition === "damaged" && "Suitable for recycling."}
                  {item.condition === "worn-out" && "Suitable for donation."}
                  {item.condition === "new" && "Suitable for selling."}
                </p>
                <div style={styles.actions}>
                  <button
                    style={styles.updateButton}
                    onClick={() => openUpdateForm(item)}
                  >
                    Update
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
      <Modal isOpen={isModalOpen} imageSrc={modalImage} onClose={closeModal} />
      {isUpdateFormOpen && (
        <UpdateForm
          item={updateItem}
          onUpdate={handleUpdate}
          onClose={closeUpdateForm}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "300px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "15px",
  },
  itemName: {
    fontSize: "18px",
    margin: "0 0 10px",
  },
  itemCondition: {
    margin: "5px 0",
  },
  itemType: {
    margin: "5px 0",
  },
  itemTimestamp: {
    margin: "10px 0 0",
    color: "#666",
  },
  actionSentence: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#007bff",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  updateButton: {
    padding: "8px 12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 12px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
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
  updateFormOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  updateFormContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  fileInput: {
    marginBottom: "10px",
  },
  imagePreview: {
    width: "100%",
    height: "auto",
    marginBottom: "10px",
    objectFit: "cover",
  },
  updateButton: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "10px",
  },
  cancelButton: {
    padding: "10px 15px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Myitems;

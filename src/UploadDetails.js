import React, { useState, useEffect } from "react";
import { storage, realtimeDb, auth } from "./firebaseDB"; // Import Firebase services
import { onAuthStateChanged } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { ref as dbRef, push } from "firebase/database";

const UploadDetails = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    itemCondition: "",
    itemType: "",
    itemPic: null,
  });
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false); // Track upload status
  const [error, setError] = useState(null); // Track errors
  const [successMessage, setSuccessMessage] = useState(""); // Track success message

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { itemName, itemCondition, itemType, itemPic } = formData;

    if (!itemPic) {
      alert("Please select an image.");
      return;
    }

    const userId = user?.uid;
    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage("");

    const storageReference = storageRef(
      storage,
      `itemPics/${userId}/${itemPic.name}`
    );
    uploadBytes(storageReference, itemPic)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((downloadURL) => {
            const timestamp = new Date().toISOString();

            const newItem = {
              name: itemName,
              condition: itemCondition,
              type: itemType,
              pic: downloadURL,
              userId: userId,
              timestamp: timestamp,
            };

            const dbReference = dbRef(realtimeDb, `items/${userId}`);
            push(dbReference, newItem)
              .then(() => {
                setSuccessMessage("Item added successfully!");
                setFormData({
                  itemName: "",
                  itemCondition: "",
                  itemType: "",
                  itemPic: null,
                });
              })
              .catch((error) => {
                setError("Error adding item: " + error.message);
              })
              .finally(() => {
                setUploading(false);
              });
          })
          .catch((error) => {
            setError("Error getting download URL: " + error.message);
            setUploading(false);
          });
      })
      .catch((error) => {
        setError("Error uploading file: " + error.message);
        setUploading(false);
      });
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      padding: "20px",
      boxSizing: "border-box",
      backgroundColor: "#f0f0f0",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "600px",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#fff",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "8px",
      boxSizing: "border-box",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    select: {
      width: "100%",
      padding: "8px",
      boxSizing: "border-box",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    button: {
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    buttonDisabled: {
      backgroundColor: "#a1a1a1",
      cursor: "not-allowed",
    },
    successMessage: {
      color: "green",
    },
    errorMessage: {
      color: "red",
    },
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Upload Item Details</h1>
        <div style={styles.formGroup}>
          <label htmlFor="itemName" style={styles.label}>
            Item Name:
          </label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="itemCondition" style={styles.label}>
            Item Condition:
          </label>
          <select
            id="itemCondition"
            name="itemCondition"
            value={formData.itemCondition}
            onChange={handleInputChange}
            required
            style={styles.select}
          >
            <option value="" disabled>
              Select condition
            </option>
            <option value="new">New</option>
            <option value="worn-out">Worn-out</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="itemType" style={styles.label}>
            Item Type:
          </label>
          <input
            type="text"
            id="itemType"
            name="itemType"
            value={formData.itemType}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="itemPic" style={styles.label}>
            Item Picture:
          </label>
          <input
            type="file"
            id="itemPic"
            name="itemPic"
            accept="image/*"
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(uploading && styles.buttonDisabled),
          }}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Submit Item"}
        </button>
        {successMessage && (
          <p style={styles.successMessage}>{successMessage}</p>
        )}
        {error && <p style={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
};

export default UploadDetails;

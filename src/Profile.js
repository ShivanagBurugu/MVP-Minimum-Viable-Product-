import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseDB";
import { useNavigate } from "react-router-dom";
import profileIcon from "./images/profile-icon.png"; // Update to the correct relative path

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Navigate to the login page
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Corporate style
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  };

  const boxStyle = {
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    textAlign: "center",
    maxWidth: "450px",
    width: "100%",
    border: "1px solid #e0e0e0",
  };

  const profileIconStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    marginBottom: "20px",
  };

  const headingStyle = {
    marginTop: "0",
    fontSize: "26px",
    fontWeight: "600",
    color: "#333",
  };

  const paragraphStyle = {
    fontSize: "18px",
    color: "#555",
    marginBottom: "10px",
  };

  const buttonStyle = {
    marginTop: "20px",
    padding: "12px 25px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    outline: "none",
    transition: "background-color 0.3s, transform 0.2s",
    boxShadow: "0 4px 6px rgba(0, 123, 255, 0.2)",
  };

  const buttonHoverStyle = {
    backgroundColor: "#0056b3",
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <img src={profileIcon} alt="Profile Icon" style={profileIconStyle} />
        <h2 style={headingStyle}>Welcome</h2>
        <p style={paragraphStyle}>Your email is {user.email}</p>
        <button
          style={buttonStyle}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              buttonHoverStyle.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              buttonStyle.backgroundColor)
          }
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;

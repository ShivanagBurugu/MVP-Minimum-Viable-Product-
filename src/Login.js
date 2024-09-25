// src/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { auth } from "./firebaseDB";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "./Auth.css"; // External CSS file for styling

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setData({
      ...data, // Keep the previous state
      [e.target.name]: e.target.value, // Update the specific field dynamically
    });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    // Handle login logic here
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      setErrorMessage("Login successful!");
      navigate("/navigator");
    } catch (error) {
      setErrorMessage(error.message);
    }
    console.log("Form Data:", data);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={data.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={data.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;

// src/Register.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebaseDB";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "./Auth.css"; // Use the same CSS for styling

const Register = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    city: "",
    phone: "",
  });
  const handleChange = (e) => {
    setData({
      ...data, // Keep the previous state
      [e.target.name]: e.target.value, // Update the specific field dynamically
    });
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    // Handle login logic here
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
        data.name,
        data.city,
        data.phone
      );

      setErrorMessage("Registration successful!");
    } catch (error) {
      setErrorMessage(error.message);
    }
    console.log("Form Data:", data);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
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
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={data.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="City"
            name="city"
            value={data.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Number"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/">Login here</Link>
        </p>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Register;

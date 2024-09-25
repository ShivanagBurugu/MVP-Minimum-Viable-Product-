// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import a CSS file specifically for Navbar styling

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/navigator/my-items">My Items</Link>
        </li>
        <li>
          <Link to="/navigator/upload-details">Upload Details</Link>
        </li>
        <li>
          <Link to="/navigator/details">All Items</Link>
        </li>
        <li>
          <Link to="/navigator/watchlist">Watchlist</Link>
        </li>
        <li>
          <Link to="/navigator/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

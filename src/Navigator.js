import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Navbar";
import Myitems from "./Myitems";
import UploadDetails from "./UploadDetails";
import AllDetails from "./AllDetails";
import Profile from "./Profile";
import Watchlist from "./WatchList";
import "./App.css";
const Navigator = () => {
  return (
    <div>
      <Navbar />
      <div></div>
      <main>
        <Routes>
          <Route path="/my-items" element={<Myitems />} />
          <Route path="/upload-details" element={<UploadDetails />} />
          <Route path="/details" element={<AllDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </main>
    </div>
  );
};

export default Navigator;

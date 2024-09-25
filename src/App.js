import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.js";
import Register from "./Register.js";
import Sample from "./Sample.js";
import Navigator from "./Navigator.js";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/navigator/*" element={<Navigator />} />

        <Route path="/sample" element={<Sample />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

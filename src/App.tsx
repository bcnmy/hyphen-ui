import React from "react";
import Home from "./pages/home/Home";

import { Routes, Route } from "react-router-dom";
import { Auth } from "./pages/auth/Auth";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default App;

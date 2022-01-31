import React from "react";
import Bridge from "./pages/bridge/Bridge";

import { Routes, Route, Navigate } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/bridge" element={<Bridge />} />
      <Route path="/" element={<Navigate replace to="/bridge" />} />
    </Routes>
  );
};

export default App;

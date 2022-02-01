import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "react-loading-skeleton/dist/skeleton.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppProviders from "./context";
import Pool from "pages/pool/Pool";

ReactDOM.render(
  <React.StrictMode>
    <ToastContainer className="font-sans font-semibold" />
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/bridge" />} />
          <Route path="/bridge" element={<App />} />
          <Route path="/pool" element={<Pool />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

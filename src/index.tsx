import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "react-loading-skeleton/dist/skeleton.css";
import { Web3Modal } from '@web3modal/react';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import AppProviders from "./context";
import { WagmiConfig } from "wagmi";
import { ethereumClient, wagmiClient, WALLET_CONNECT_PROJECT_ID } from "config/wagmi";

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <ToastContainer className="font-sans font-semibold" />
      <AppProviders>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProviders>
    </WagmiConfig>
    <Web3Modal ethereumClient={ethereumClient} projectId={WALLET_CONNECT_PROJECT_ID} />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

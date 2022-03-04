import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppProviders from './context';
import Pool from 'pages/pool/Pool';
import Bridge from 'pages/bridge/Bridge';
import AddLiquidity from 'pages/pool/components/AddLiquidity';
import PoolsOverview from 'pages/pool/components/PoolsOverview';
import PoolOverview from 'pages/pool/components/PoolsOverview/Pools/PoolOverview';
import ManagePosition from 'pages/pool/components/ManagePosition';
import IncreaseLiquidity from 'pages/pool/components/IncreaseLiquidity';

// Refetch the data after 1 hour.
const oneHourInMs = 60 * 60 * 1000;
const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: oneHourInMs,
    },
  },
};
const queryClient = new QueryClient(queryClientOptions);

ReactDOM.render(
  <React.StrictMode>
    <ToastContainer className="font-sans font-semibold" />
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="/" element={<Navigate replace to="/bridge" />} />
              <Route path="/bridge" element={<Bridge />} />
              <Route path="/pool" element={<Pool />}>
                <Route path="" element={<PoolsOverview />} />
                <Route path="add-liquidity" element={<AddLiquidity />} />
                <Route
                  path="add-liquidity/:chainId/:tokenSymbol"
                  element={<AddLiquidity />}
                />
                <Route
                  path="manage-position/:chainId/:positionId"
                  element={<ManagePosition />}
                />
                <Route
                  path="increase-liquidity/:chainId/:positionId"
                  element={<IncreaseLiquidity />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProviders>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

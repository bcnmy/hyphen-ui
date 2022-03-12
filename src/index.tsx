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
import Pools from 'pages/pools/Pools';
import Bridge from 'pages/bridge/Bridge';
import AddLiquidity from 'pages/pools/components/AddLiquidity';
import PoolsOverview from 'pages/pools/components/PoolsOverview';
import ManagePosition from 'pages/pools/components/ManageLiquidity';
import IncreaseLiquidity from 'pages/pools/components/IncreaseLiquidity';
import Farms from 'pages/farms/Farms';
import FarmsOverview from 'pages/farms/components/FarmsOverview';
import AddStakingPosition from 'pages/farms/components/AddStakingPosition';
import ManageStakingPosition from 'pages/farms/components/ManageStakingPosition';

const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
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
              <Route path="/pools" element={<Pools />}>
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
              <Route path="/farms" element={<Farms />}>
                <Route path="" element={<FarmsOverview />} />
                <Route
                  path="add-staking-position/:chainId/:tokenSymbol"
                  element={<AddStakingPosition />}
                />
                <Route
                  path="manage-staking-position/:chainId/:positionId"
                  element={<ManageStakingPosition />}
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

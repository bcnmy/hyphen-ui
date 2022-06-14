import Bridge from 'pages/bridge/Bridge';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import 'react-loading-skeleton/dist/skeleton.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import AppProviders from './context';
import './index.css';
const Farms = React.lazy(() => import('pages/farms'));
const AddStakingPosition = React.lazy(
  () => import('pages/farms/components/AddStakingPosition'),
);
const FarmsOverview = React.lazy(
  () => import('pages/farms/components/FarmsOverview'),
);
const ManageStakingPosition = React.lazy(
  () => import('pages/farms/components/ManageStakingPosition'),
);
const Pools = React.lazy(() => import('pages/pools'));
const AddLiquidity = React.lazy(
  () => import('pages/pools/components/AddLiquidity'),
);
const IncreaseLiquidity = React.lazy(
  () => import('pages/pools/components/IncreaseLiquidity'),
);
const ManagePosition = React.lazy(
  () => import('pages/pools/components/ManageLiquidity'),
);
const PoolsOverview = React.lazy(
  () => import('pages/pools/components/PoolsOverview'),
);

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
              <Route
                path="/pools"
                element={
                  <Suspense fallback={<>...</>}>
                    <Pools />
                  </Suspense>
                }
              >
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
              <Route
                path="/farms"
                element={
                  <Suspense fallback={<>...</>}>
                    <Farms />
                  </Suspense>
                }
              >
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

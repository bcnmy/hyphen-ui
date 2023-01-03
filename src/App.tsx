import ErrorFallback from 'components/ErrorFallback';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import Layout from '../src/components/Layout';
import "@biconomy/web3-auth/dist/src/style.css"

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Layout>
        <Outlet />
      </Layout>
    </ErrorBoundary>
  );
};

export default App;

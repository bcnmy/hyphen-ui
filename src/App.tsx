import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet } from 'react-router-dom';
import Layout from '../src/components/Layout';

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

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Outlet />
      </Layout>
    </QueryClientProvider>
  );
};

export default App;

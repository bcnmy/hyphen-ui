import Layout from './Layout';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <Layout>
      <div className="my-24">
        <div className="mx-auto flex h-100 max-w-xl flex-col gap-2 rounded-10 bg-white p-6 shadow-lg">
          <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: 'red' }}>{error.message}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ErrorFallback;

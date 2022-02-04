import Layout from '../../components/Layout';
import PoolsOverview from './components/PoolsOverview';

function Pool() {
  return (
    <Layout>
      <main className="mx-auto w-[64rem] max-w-5xl">
        <PoolsOverview />
      </main>
    </Layout>
  );
}

export default Pool;

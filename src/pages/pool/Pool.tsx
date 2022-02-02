import Layout from "../../components/Layout";
import PoolsOverview from "./components/PoolsOverview";

function Pool() {
  return (
    <Layout>
      <main className="w-[64rem] max-w-5xl mx-auto">
        <PoolsOverview />
      </main>
    </Layout>
  );
}

export default Pool;

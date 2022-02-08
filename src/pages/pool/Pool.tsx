import AddLiquidity from './components/AddLiquidity';
import PoolsOverview from './components/PoolsOverview';

function Pool() {
  return (
    <main className="mx-auto w-[64rem] max-w-5xl">
      <PoolsOverview />
      <AddLiquidity />
    </main>
  );
}

export default Pool;

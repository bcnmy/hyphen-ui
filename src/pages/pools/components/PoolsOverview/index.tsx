import Pools from './Pools';
import LiquidityPositions from './LiquidityPositions';

function PoolsOverview() {
  return (
    <article className="my-12 px-6 xl:my-24 xl:px-0">
      <LiquidityPositions />
      <Pools />
    </article>
  );
}

export default PoolsOverview;

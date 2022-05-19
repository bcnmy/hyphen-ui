import Pools from './Pools';
import LiquidityPositions from './LiquidityPositions';

function PoolsOverview() {
  return (
    <article className="my-12 xl:my-24">
      <LiquidityPositions />
      <Pools />
    </article>
  );
}

export default PoolsOverview;

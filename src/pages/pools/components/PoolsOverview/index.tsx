import Pools from './Pools';
import LiquidityPositions from './LiquidityPositions';

function PoolsOverview() {
  return (
    <article className="my-24">
      <LiquidityPositions />
      <Pools />
    </article>
  );
}

export default PoolsOverview;

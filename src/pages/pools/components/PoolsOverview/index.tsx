import Pools from './Pools';
import LiquidityPositions from './LiquidityPositions';

function PoolsOverview() {
  return (
    <article className="my-12.5">
      <LiquidityPositions />
      <Pools />
    </article>
  );
}

export default PoolsOverview;

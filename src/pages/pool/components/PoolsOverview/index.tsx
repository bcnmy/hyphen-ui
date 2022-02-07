import Pools from './Pools';
import YourPositions from './YourPositions';

function PoolsOverview() {
  return (
    <article className="my-24">
      <YourPositions />
      <Pools />
    </article>
  );
}

export default PoolsOverview;

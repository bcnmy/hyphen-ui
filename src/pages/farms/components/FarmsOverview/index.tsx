import Farms from './Farms';
import FarmPositions from './FarmPositions';

function FarmsOverview() {
  return (
    <article className="my-12 xl:my-24">
      <FarmPositions />
      <Farms />
    </article>
  );
}

export default FarmsOverview;

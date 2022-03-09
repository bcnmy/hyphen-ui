import { chains } from 'config/chains';
import tokens from 'config/tokens';
import { BigNumber } from 'ethers';
import useLPToken from 'hooks/contracts/useLPToken';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';

interface IStakingPositionOverview {
  chainId: number;
  positionId: BigNumber;
}

function StakingPositionOverview({
  chainId,
  positionId,
}: IStakingPositionOverview) {
  const location = useLocation();
  const navigate = useNavigate();

  const chain = chains.find(chainObj => {
    return chainObj.chainId === chainId;
  })!;

  const { getPositionMetadata } = useLPToken(chain);

  const { isLoading: isPositionMetadataLoading, data: positionMetadata } =
    useQuery(['positionMetadata', positionId], () =>
      getPositionMetadata(positionId),
    );

  const [tokenAddress, suppliedLiquidity, shares] = positionMetadata || [];

  const token =
    chain && tokenAddress
      ? tokens.find(tokenObj => {
          return (
            tokenObj[chainId]?.address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : null;

  const isUserOnFarms = location.pathname === '/farms';

  const { name: chainName } = chain;
  const {
    image: tokenImage,
    symbol: tokenSymbol,
    [chain.chainId]: { chainColor },
  } = token;

  function handleStakingPositionClick() {
    if (isUserOnFarms) {
      navigate(`manage-staking-position/${chain?.chainId}/${positionId}`);
    }
  }

  return (
    <section
      className={`flex h-37.5 items-center justify-between rounded-7.5 border px-10 py-6 text-hyphen-gray-400 ${
        isUserOnFarms ? 'cursor-pointer' : ''
      }`}
      onClick={handleStakingPositionClick}
      style={{ backgroundColor: chainColor }}
    >
      <div className="flex flex-col">
        <span className="mb-2.5 text-xxs font-bold uppercase">
          Asset supplied
        </span>
        <div className="mb-5 flex items-center">
          <img src={tokenImage} alt={tokenSymbol} className="mr-2 h-8 w-8" />
          <div className="flex flex-col">
            <span className="font-mono text-2xl ">
              {formattedSuppliedLiquidity} {tokenSymbol}
            </span>
            <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
              {chainName}
            </span>
          </div>
        </div>
        <span className="font-mono text-xs">Pool Share: {poolShare}%</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="mb-2.5 text-xxs font-bold uppercase ">APY</span>
        <div className="mb-5">
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <span className="font-mono text-2xl">
                {APY >= 0 ? `${APY}%` : '...'}
              </span>
              <HiInformationCircle
                className="ml-1 h-5 w-5 cursor-default text-hyphen-gray-400"
                data-tip
                data-for={`${positionId}-apy`}
                onClick={e => e.stopPropagation()}
              />
              <CustomTooltip id={`${positionId}-apy`}>
                <p>Reward APY: {rewardAPY}%</p>
                <p>Fee APY: {feeAPY >= 0 ? `${feeAPY}%` : '...'}</p>
              </CustomTooltip>
            </div>
            <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
              Annualized
            </span>
          </div>
        </div>
        <span className="font-mono text-xs">
          Unclaimed Fees: ~ {unclaimedFees > 0 ? unclaimedFees.toFixed(5) : 0}{' '}
          {tokenSymbol}
        </span>
      </div>
    </section>
  );
}

export default StakingPositionOverview;

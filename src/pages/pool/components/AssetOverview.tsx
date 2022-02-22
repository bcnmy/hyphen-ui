import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import tokens from 'config/tokens';
import { useWalletProvider } from 'context/WalletProvider';
import { chains } from 'config/chains';
import useLPTokenContract from 'hooks/useLPToken';
import useLPContract from 'hooks/useLiquidityProviders';

interface IAssetOverview {
  positionId: BigNumber;
  redirectToManageLiquidity?: boolean | false;
}

function AssetOverview({
  positionId,
  redirectToManageLiquidity,
}: IAssetOverview) {
  const navigate = useNavigate();
  const { currentChainId } = useWalletProvider()!;
  const { getPositionMetadata } = useLPTokenContract();
  const { getTokenAmount, getTotalLiquidity } = useLPContract();
  const { isLoading, data: positionMetadata } = useQuery(
    ['positionMetadata', positionId],
    () => getPositionMetadata(positionId),
  );
  const {
    shares,
    suppliedLiquidity,
    token: tokenAddress,
  } = positionMetadata || {};
  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', tokenAddress],
    () => getTotalLiquidity(tokenAddress),
    {
      // Execute only when metadata is available.
      enabled: !!positionMetadata,
    },
  );
  const { data: tokenAmount } = useQuery(
    ['tokenAmount', { shares, tokenAddress }],
    () => getTokenAmount(shares, tokenAddress),
    {
      // Execute only when metadata is available.
      enabled: !!positionMetadata,
    },
  );

  function handleAssetOverviewClick() {
    if (redirectToManageLiquidity) {
      navigate('manage-position');
    }
  }

  if (isLoading) return null;

  const chain = currentChainId
    ? chains.find(chain => chain.chainId === currentChainId)
    : null;
  const token = currentChainId
    ? tokens.find(token => {
        const { address } = token[currentChainId];
        return address.toLowerCase() === tokenAddress.toLowerCase();
      })
    : null;

  const { name: chainName } = chain!;
  const {
    image: tokenImage,
    symbol: tokenSymbol,
    [currentChainId]: { chainColor },
  } = token!;
  const poolShare =
    suppliedLiquidity && totalLiquidity
      ? (suppliedLiquidity.toNumber() / totalLiquidity.toNumber()) * 100
      : 0;

  const apy = 81.19;
  const unclaimedFees =
    suppliedLiquidity && tokenAmount
      ? suppliedLiquidity.toNumber() - tokenAmount.toNumber()
      : 0;

  return (
    <section
      className="flex h-37.5 items-center justify-between rounded-7.5 border px-10 py-6 text-hyphen-gray-400"
      onClick={handleAssetOverviewClick}
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
              {suppliedLiquidity.toNumber()} {tokenSymbol}
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
          <div className="flex flex-col">
            <span className="font-mono text-2xl">{apy}%</span>
            <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
              Annualized
            </span>
          </div>
        </div>
        <span className="font-mono text-xs">
          Unclaimed Fees: ~ ${unclaimedFees}
        </span>
      </div>
    </section>
  );
}

export default AssetOverview;

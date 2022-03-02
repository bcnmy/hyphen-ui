import { BigNumber, ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import tokens from 'config/tokens';
import { useWalletProvider } from 'context/WalletProvider';
import { chains } from 'config/chains';
import useLPToken from 'hooks/useLPToken';
import useLiquidityProviders from 'hooks/useLiquidityProviders';
import Skeleton from 'react-loading-skeleton';

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

  const { getPositionMetadata } = useLPToken();
  const { getTokenAmount, getTotalLiquidity } = useLiquidityProviders();

  const { isLoading: isPositionMetadataLoading, data: positionMetadata } =
    useQuery(['positionMetadata', positionId], () =>
      getPositionMetadata(positionId),
    );

  const [tokenAddress, suppliedLiquidity, shares] = positionMetadata || [];

  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', tokenAddress],
    () => getTotalLiquidity(tokenAddress),
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  const { data: tokenAmount } = useQuery(
    ['tokenAmount', { shares, tokenAddress }],
    () => getTokenAmount(shares, tokenAddress),
    {
      // Execute only when shares & tokenAddress is available.
      enabled: !!(shares && tokenAddress),
    },
  );

  const chain = currentChainId
    ? chains.find(chainObj => {
        return chainObj.chainId === currentChainId;
      })
    : null;

  const token =
    currentChainId && tokenAddress
      ? tokens.find(tokenObj => {
          return (
            tokenObj[currentChainId].address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : null;

  if (isPositionMetadataLoading || !token || !chain || !currentChainId) {
    return (
      <Skeleton
        baseColor="#615ccd20"
        enableAnimation
        highlightColor="#615ccd05"
        className="!h-37.5 !rounded-7.5"
        containerClassName="block leading-none"
      />
    );
  }

  const tokenDecimals =
    currentChainId && token ? token[currentChainId].decimal : null;

  const formattedTotalLiquidity =
    totalLiquidity && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(totalLiquidity, tokenDecimals),
        )
      : totalLiquidity;

  const formattedSuppliedLiquidity =
    suppliedLiquidity && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidity, tokenDecimals),
        )
      : suppliedLiquidity;

  const formattedTokenAmount =
    tokenAmount && tokenDecimals
      ? Number.parseFloat(ethers.utils.formatUnits(tokenAmount, tokenDecimals))
      : tokenAmount;

  const { name: chainName } = chain;
  const {
    image: tokenImage,
    symbol: tokenSymbol,
    [currentChainId]: { chainColor },
  } = token;
  const poolShare =
    suppliedLiquidity && totalLiquidity
      ? Math.round(
          (formattedSuppliedLiquidity / formattedTotalLiquidity) * 100 * 100,
        ) / 100
      : 0;

  const apy = 81.19;
  const unclaimedFees =
    suppliedLiquidity && tokenAmount
      ? formattedSuppliedLiquidity - formattedTokenAmount
      : 0;

  function handleAssetOverviewClick() {
    if (redirectToManageLiquidity) {
      navigate(`manage-position/${currentChainId}/${positionId}`);
    }
  }

  return (
    <section
      className={`flex h-37.5 items-center justify-between rounded-7.5 border px-10 py-6 text-hyphen-gray-400 ${
        redirectToManageLiquidity ? 'cursor-pointer' : ''
      }`}
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

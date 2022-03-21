import { BigNumber, ethers } from 'ethers';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { request, gql } from 'graphql-request';
import tokens from 'config/tokens';
import { chains } from 'config/chains';
import useLPToken from 'hooks/contracts/useLPToken';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import Skeleton from 'react-loading-skeleton';
import { HiInformationCircle, HiOutlineXCircle } from 'react-icons/hi';
import CustomTooltip from 'components/CustomTooltip';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';

interface ILiquidityPositionOverview {
  chainId: number;
  positionId: BigNumber;
  hideClosedPositions?: boolean | false;
}

function LiquidityPositionOverview({
  chainId,
  positionId,
  hideClosedPositions,
}: ILiquidityPositionOverview) {
  const location = useLocation();
  const navigate = useNavigate();

  const chain = chains.find(chainObj => {
    return chainObj.chainId === chainId;
  })!;

  const v2GraphEndpoint = chain.v2GraphURL;

  const { getPositionMetadata } = useLPToken(chain);
  const { getSuppliedLiquidityByToken, getTokenAmount, getTotalLiquidity } =
    useLiquidityProviders(chain);
  const { getRewardRatePerSecond, getRewardTokenAddress } =
    useLiquidityFarming(chain);

  const {
    isError: positionMetadataError,
    isLoading: isPositionMetadataLoading,
    data: positionMetadata,
  } = useQuery(['positionMetadata', positionId], () =>
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

  const tokenDecimals = chain && token ? token[chain.chainId].decimal : null;

  const {
    isError: totalLiquidityError,
    isLoading: isTotalLiquidityLoading,
    data: totalLiquidity,
  } = useQuery(
    ['totalLiquidity', tokenAddress],
    () => getTotalLiquidity(tokenAddress),
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  const {
    isError: tokenAmountError,
    isLoading: isTokenAmountLoading,
    data: tokenAmount,
  } = useQuery(
    ['tokenAmount', { shares, tokenAddress }],
    () => getTokenAmount(shares, tokenAddress),
    {
      // Execute only when shares & tokenAddress is available.
      enabled: !!(shares && tokenAddress),
    },
  );

  const { isError: feeAPYDataError, data: feeAPYData } = useQuery(
    ['apy', tokenAddress],
    async () => {
      if (!v2GraphEndpoint || !tokenAddress) return;

      const { rollingApyFor24Hour } = await request(
        v2GraphEndpoint,
        gql`
          query {
            rollingApyFor24Hour(id: "${tokenAddress.toLowerCase()}") {
              apy
            }
          }
        `,
      );
      return rollingApyFor24Hour;
    },
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  const {
    isError: suppliedLiquidityByTokenError,
    data: suppliedLiquidityByToken,
  } = useQuery(
    ['suppliedLiquidityByToken', tokenAddress],
    () => getSuppliedLiquidityByToken(tokenAddress),
    {
      // Execute only when address is available.
      enabled: !!tokenAddress,
    },
  );

  const { isError: tokenPriceInUSDError, data: tokenPriceInUSD } = useQuery(
    ['tokenPriceInUSD', token],
    () =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token?.coinGeckoId}&vs_currencies=usd`,
      ).then(res => res.json()),
    {
      enabled: !!token,
    },
  );

  const { isError: rewardsPerSecondError, data: rewardsRatePerSecond } =
    useQuery(
      ['rewardsRatePerSecond', tokenAddress],
      () => getRewardRatePerSecond(tokenAddress),
      {
        // Execute only when address is available.
        enabled: !!tokenAddress,
      },
    );

  const { isError: rewardTokenAddressError, data: rewardTokenAddress } =
    useQuery(
      ['rewardTokenAddress', tokenAddress],
      () => getRewardTokenAddress(tokenAddress),
      {
        // Execute only when address is available.
        enabled: !!tokenAddress,
      },
    );

  const rewardToken = rewardTokenAddress
    ? tokens.find(tokenObj => {
        return tokenObj[chain.chainId]
          ? tokenObj[chain.chainId].address.toLowerCase() ===
              rewardTokenAddress.toLowerCase()
          : false;
      })
    : undefined;

  const { isError: rewardTokenPriceInUSDError, data: rewardTokenPriceInUSD } =
    useQuery(
      ['rewardTokenPriceInUSD', rewardToken?.coinGeckoId],
      () => {
        if (!rewardToken) return;

        return fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${rewardToken.coinGeckoId}&vs_currencies=usd`,
        ).then(res => res.json());
      },
      {
        enabled: !!rewardToken,
      },
    );

  const rewardRatePerSecondInUSD =
    rewardsRatePerSecond && rewardTokenPriceInUSD && rewardToken
      ? Number.parseFloat(
          ethers.utils.formatUnits(
            rewardsRatePerSecond,
            rewardToken[chain.chainId].decimal,
          ),
        ) * rewardTokenPriceInUSD[rewardToken.coinGeckoId as string].usd
      : 0;

  const totalValueLockedInUSD =
    suppliedLiquidityByToken && tokenPriceInUSD && token && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidityByToken, tokenDecimals),
        ) * tokenPriceInUSD[token.coinGeckoId as string].usd
      : 0;

  const secondsInYear = 31536000;
  const rewardAPY =
    rewardRatePerSecondInUSD && totalValueLockedInUSD
      ? (Math.pow(
          1 + rewardRatePerSecondInUSD / totalValueLockedInUSD,
          secondsInYear,
        ) -
          1) *
        100
      : 0;

  const feeAPY = feeAPYData
    ? Number.parseFloat(Number.parseFloat(feeAPYData.apy).toFixed(2))
    : 0;
  const APY = rewardAPY + feeAPY;

  const isError =
    positionMetadataError ||
    totalLiquidityError ||
    tokenAmountError ||
    feeAPYDataError ||
    suppliedLiquidityByTokenError ||
    tokenPriceInUSDError ||
    rewardsPerSecondError ||
    rewardTokenAddressError ||
    rewardTokenPriceInUSDError;

  const isDataLoading =
    isPositionMetadataLoading ||
    isTotalLiquidityLoading ||
    isTokenAmountLoading;

  if (isDataLoading || !token || !chain) {
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

  if (isError) {
    return (
      <section className="flex h-37.5 items-center justify-center rounded-7.5 border bg-white px-10 py-6 text-hyphen-gray-400">
        <div className="my-16 flex items-center">
          <HiOutlineXCircle className="mr-4 h-6 w-6 text-red-400" />
          <span className="text-hyphen-gray-400">
            Something went wrong while we were fetching this position, please
            try again later.
          </span>
        </div>
      </section>
    );
  }

  const isUserOnPools =
    location.pathname === '/pools' || location.pathname === '/pools/';

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
    [chain.chainId]: { chainColor },
  } = token;
  const poolShare =
    suppliedLiquidity && totalLiquidity
      ? Math.round(
          (formattedSuppliedLiquidity / formattedTotalLiquidity) * 100 * 100,
        ) / 100
      : 0;

  const unclaimedFees =
    formattedSuppliedLiquidity && formattedTokenAmount
      ? formattedTokenAmount - formattedSuppliedLiquidity
      : 0;

  function handleLiquidityPositionClick() {
    if (formattedSuppliedLiquidity > 0 && isUserOnPools) {
      navigate(`manage-position/${chain?.chainId}/${positionId}`);
    }
  }

  if (hideClosedPositions && formattedSuppliedLiquidity <= 0 && isUserOnPools)
    return null;

  if (!hideClosedPositions && formattedSuppliedLiquidity > 0 && isUserOnPools)
    return null;

  return (
    <section
      className={`flex h-37.5 items-center justify-between rounded-7.5 border px-10 py-6 text-hyphen-gray-400 ${
        formattedSuppliedLiquidity > 0 && isUserOnPools
          ? 'cursor-pointer'
          : 'cursor-not-allowed'
      }`}
      onClick={handleLiquidityPositionClick}
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
                {APY > 10000
                  ? '>10,000%'
                  : `${Number.parseFloat(APY.toFixed(3))}%`}
              </span>
              <HiInformationCircle
                className="ml-1 h-5 w-5 cursor-default text-hyphen-gray-400"
                data-tip
                data-for={`${positionId}-apy`}
                onClick={e => e.stopPropagation()}
              />
              <CustomTooltip id={`${positionId}-apy`}>
                <p>
                  Reward APY:{' '}
                  {rewardAPY > 10000
                    ? '>10,000%'
                    : `${Number.parseFloat(rewardAPY.toFixed(3))}%`}
                </p>
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

export default LiquidityPositionOverview;

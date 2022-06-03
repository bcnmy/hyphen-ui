import { BigNumber, ethers } from 'ethers';
import useLPToken from 'hooks/contracts/useLPToken';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { Decimal } from 'decimal.js';
import { HiOutlineXCircle } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { OPTIMISM_CHAIN_ID } from 'config/constants';

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

  const { networks } = useChains()!;
  const { tokens } = useToken()!;

  const chain = networks?.find(networkObj => {
    return networkObj.chainId === chainId;
  })!;

  const { getPositionMetadata } = useLPToken(chain);
  const {
    getBaseDivisor,
    getTokenPriceInLPShares,
    getSuppliedLiquidityByToken,
  } = useLiquidityProviders(chain);
  const {
    getPendingToken,
    getRewardRatePerSecond,
    getRewardTokenAddress,
    getTotalSharesStaked,
  } = useLiquidityFarming(chain);

  const {
    data: positionMetadata,
    isError: positionMetadataError,
    isLoading: isPositionMetadataLoading,
  } = useQuery(['positionMetadata', positionId], () =>
    getPositionMetadata(positionId),
  );

  const { data: baseDivisor, isError: baseDivisorError } = useQuery(
    'baseDivisor',
    () => getBaseDivisor(),
  );

  const [tokenAddress, suppliedLiquidity, shares] = positionMetadata || [];

  const tokenSymbol =
    chainId && tokens && tokenAddress
      ? Object.keys(tokens).find(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return (
            tokenObj[chainId]?.address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : undefined;
  const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;

  const tokenDecimals = chain && token ? token[chain.chainId].decimal : null;

  const { data: tokenPriceInLPShares, isError: tokenPriceInLPSharesError } =
    useQuery(
      ['tokenPriceInLPShares', tokenAddress],
      () => getTokenPriceInLPShares(tokenAddress),
      {
        // Execute only when address is available.
        enabled: !!tokenAddress,
      },
    );

  const {
    data: suppliedLiquidityByToken,
    isError: suppliedLiquidityByTokenError,
  } = useQuery(
    ['suppliedLiquidityByToken', tokenAddress],
    () => getSuppliedLiquidityByToken(tokenAddress),
    {
      // Execute only when address is available.
      enabled: !!tokenAddress,
    },
  );

  const { data: tokenPriceInUSD, isError: tokenPriceInUSDError } = useQuery(
    ['tokenPriceInUSD', token?.coinGeckoId],
    () =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token?.coinGeckoId}&vs_currencies=usd`,
      ).then(res => res.json()),
    {
      enabled: !!token,
    },
  );

  const { data: rewardTokenAddress, isError: rewardTokenAddressError } =
    useQuery(
      ['rewardTokenAddress', token],
      () => {
        if (!chain || !token) return;

        return getRewardTokenAddress(token[chain.chainId].address);
      },
      {
        // Execute only when address is available.
        enabled: !!(chain && token),
      },
    );

  const { data: rewardsRatePerSecond, isError: rewardsRatePerSecondError } =
    useQuery(
      ['rewardsRatePerSecond', token],
      () => {
        if (!token || !rewardTokenAddress) return;

        if (chainId === OPTIMISM_CHAIN_ID) {
          return getRewardRatePerSecond(
            token[chainId].address,
            rewardTokenAddress,
          );
        } else {
          return getRewardRatePerSecond(token[chainId].address);
        }
      },
      {
        // Execute only when address is available.
        enabled: !!(token && rewardTokenAddress),
      },
    );

  const { data: totalSharesStaked, isError: totalSharesStakedError } = useQuery(
    ['totalSharesStaked', token],
    () => {
      if (!chain || !token) return;

      return getTotalSharesStaked(token[chain.chainId].address);
    },
    {
      // Execute only when address is available.
      enabled: !!(chain && token),
    },
  );

  const { data: pendingToken, isError: pendingTokenError } = useQuery(
    ['pendingToken', positionId],
    () => {
      if (chainId === OPTIMISM_CHAIN_ID) {
        return getPendingToken(positionId, rewardTokenAddress);
      } else {
        return getPendingToken(positionId);
      }
    },
    {
      enabled: !!(positionId && rewardTokenAddress),
    },
  );

  const rewardTokenSymbol =
    rewardTokenAddress && tokens && chain
      ? Object.keys(tokens).find(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return tokenObj[chain.chainId]
            ? tokenObj[chain.chainId].address.toLowerCase() ===
                rewardTokenAddress.toLowerCase()
            : false;
        })
      : undefined;
  const rewardToken =
    tokens && rewardTokenSymbol ? tokens[rewardTokenSymbol] : undefined;

  const rewardTokenDecimals =
    chain && rewardToken ? rewardToken[chain.chainId].decimal : null;

  const { data: rewardTokenPriceInUSD, isError: rewardTokenPriceInUSDError } =
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

  // Check if there's an error in queries or mutations.
  const isError =
    positionMetadataError ||
    baseDivisorError ||
    tokenPriceInLPSharesError ||
    suppliedLiquidityByTokenError ||
    tokenPriceInUSDError ||
    pendingTokenError ||
    rewardsRatePerSecondError ||
    rewardTokenAddressError ||
    rewardTokenPriceInUSDError ||
    totalSharesStakedError;

  const isDataLoading = isPositionMetadataLoading;

  if (isError) {
    return (
      <section className="flex h-37.5 items-center justify-center rounded-7.5 border bg-white px-10 py-6 text-hyphen-gray-400">
        <div className="my-16 flex items-center">
          <HiOutlineXCircle className="mr-4 h-6 w-6 text-red-400" />
          <span className="text-hyphen-gray-400">
            Something went wrong while we were fetching this staked position,
            please try again later.
          </span>
        </div>
      </section>
    );
  }

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

  const isUserOnFarms = location.pathname === '/farms';

  const formattedSuppliedLiquidity =
    suppliedLiquidity && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidity, tokenDecimals),
        )
      : 0;

  const formattedTotalSharesStaked =
    totalSharesStaked && tokenDecimals
      ? ethers.utils.formatUnits(totalSharesStaked, tokenDecimals)
      : 0;

  const { name: chainName } = chain;
  const {
    image: tokenImage,
    [chain.chainId]: { chainColor },
  } = token;

  const tvl =
    totalSharesStaked &&
    baseDivisor &&
    tokenPriceInLPShares &&
    tokenDecimals &&
    tokenPriceInUSD &&
    token
      ? new Decimal(totalSharesStaked.toString())
          .mul(baseDivisor.toString())
          .div(
            new Decimal(tokenPriceInLPShares.toString()).mul(
              10 ** tokenDecimals,
            ),
          )
          .mul(tokenPriceInUSD[token.coinGeckoId as string].usd)
          .toNumber()
      : 0;

  const rewardRatePerSecondInUSD =
    rewardsRatePerSecond &&
    rewardToken &&
    rewardTokenPriceInUSD &&
    rewardTokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(rewardsRatePerSecond, rewardTokenDecimals),
        ) * rewardTokenPriceInUSD[rewardToken.coinGeckoId as string].usd
      : 0;

  const totalValueLockedInUSD =
    suppliedLiquidityByToken && tokenPriceInUSD && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidityByToken, tokenDecimals),
        ) * tokenPriceInUSD[token?.coinGeckoId as string].usd
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

  const SECONDS_IN_24_HOURS = 86400;
  const rewardsPerDay =
    rewardsRatePerSecond && rewardToken && chain && rewardTokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(rewardsRatePerSecond, rewardTokenDecimals),
        ) * SECONDS_IN_24_HOURS
      : 0;

  const yourRewardRate =
    baseDivisor &&
    tokenDecimals &&
    shares &&
    formattedTotalSharesStaked > 0 &&
    rewardsPerDay > 0
      ? new Decimal(shares.toString())
          .div(baseDivisor.toString())
          .div(totalSharesStaked.toString())
          .mul(rewardsPerDay.toString())
          .toNumber()
      : 0;

  const unclaimedRewardToken =
    pendingToken && rewardTokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(pendingToken, rewardTokenDecimals),
        )
      : 0;

  function handleStakingPositionClick() {
    if (isUserOnFarms) {
      navigate(`manage-staking-position/${chain?.chainId}/${positionId}`);
    }
  }

  return (
    <section
      className={`grid h-37.5 grid-cols-3 rounded-7.5 border px-10 py-6 text-hyphen-gray-400 ${
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
        <span className="font-mono text-xs">
          TVL: ${makeNumberCompact(tvl, 3)}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <span className="mb-2.5 text-xxs font-bold uppercase ">Reward APY</span>
        <div className="mb-5">
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <span className="font-mono text-2xl">
                {rewardAPY > 10000
                  ? '>10,000%'
                  : `${Number.parseFloat(rewardAPY.toFixed(3))}%`}
              </span>
            </div>
            <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
              Annualized
            </span>
          </div>
        </div>
        <span className="font-mono text-xs">
          Farm Rate:{' '}
          {rewardsPerDay >= 0 && rewardToken ? (
            `${makeNumberCompact(
              Number.parseFloat(rewardsPerDay.toFixed(3)),
              3,
            )} ${rewardToken.symbol} per day`
          ) : (
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!mx-1 !w-28"
            />
          )}
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="mb-2.5 text-xxs font-bold uppercase ">
          Your Reward Rate
        </span>
        <div className="mb-5">
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <span className="font-mono text-2xl">
                {' '}
                {yourRewardRate >= 0 && rewardToken ? (
                  <div className="flex items-center">
                    <img
                      src={rewardToken.image}
                      alt={rewardToken.symbol}
                      className="mr-2.5 h-5 w-5"
                    />
                    {makeNumberCompact(
                      Number.parseFloat(yourRewardRate.toFixed(3)),
                      3,
                    )}{' '}
                    {rewardToken.symbol}
                  </div>
                ) : (
                  <Skeleton
                    baseColor="#615ccd20"
                    enableAnimation
                    highlightColor="#615ccd05"
                    className="!mx-1 !w-28"
                  />
                )}
              </span>
            </div>
            <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
              Per Day
            </span>
          </div>
        </div>
        <span className="font-mono text-xs">
          {rewardToken && unclaimedRewardToken >= 0 ? (
            `Unclaimed ${rewardToken.symbol}: ${
              unclaimedRewardToken > 0
                ? makeNumberCompact(
                    Number.parseFloat(unclaimedRewardToken.toFixed(5)),
                    5,
                  )
                : 0
            }`
          ) : (
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!mx-1 !w-28"
            />
          )}
        </span>
      </div>
    </section>
  );
}

export default StakingPositionOverview;

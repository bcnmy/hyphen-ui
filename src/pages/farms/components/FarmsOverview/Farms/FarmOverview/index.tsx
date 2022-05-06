import { ethers } from 'ethers';
import { useQuery, useQueryClient } from 'react-query';
import Skeleton from 'react-loading-skeleton';
import { HiOutlineXCircle } from 'react-icons/hi';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { useNavigate } from 'react-router-dom';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import { Network } from 'hooks/useNetworks';
import { useToken } from 'context/Token';

interface IFarmOverview {
  chain: Network;
  token: any;
}

function FarmOverview({ chain, token }: IFarmOverview) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { address, chainColor, coinGeckoId, decimal, symbol, tokenImage } =
    token;

  const { tokens } = useToken()!;

  const { getSuppliedLiquidityByToken } = useLiquidityProviders(chain);
  const { getRewardRatePerSecond, getRewardTokenAddress } =
    useLiquidityFarming(chain);

  const {
    data: suppliedLiquidityByToken,
    isError: suppliedLiquidityByTokenError,
  } = useQuery(
    ['suppliedLiquidityByToken', address],
    () => getSuppliedLiquidityByToken(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: tokenPriceInUSD, isError: tokenPriceInUSDError } = useQuery(
    ['tokenPriceInUSD', coinGeckoId],
    () =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`,
      ).then(res => res.json()),
    {
      enabled: !!coinGeckoId,
    },
  );

  const { data: rewardsRatePerSecond, isError: rewardsRatePerSecondError } =
    useQuery(
      ['rewardsRatePerSecond', address],
      () => getRewardRatePerSecond(address),
      {
        // Execute only when address is available.
        enabled: !!address,
      },
    );

  const { data: rewardTokenAddress, isError: rewardTokenAddressError } =
    useQuery(
      ['rewardTokenAddress', address],
      () => getRewardTokenAddress(address),
      {
        // Execute only when address is available.
        enabled: !!address,
      },
    );

  const rewardTokenSymbol =
    rewardTokenAddress && tokens
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
    suppliedLiquidityByTokenError ||
    tokenPriceInUSDError ||
    rewardsRatePerSecondError ||
    rewardTokenAddressError ||
    rewardTokenPriceInUSDError;

  if (isError) {
    return (
      <section className="flex h-37.5 items-center justify-center border bg-white px-10 py-6 text-hyphen-gray-400">
        <div className="my-16 flex items-center">
          <HiOutlineXCircle className="mr-4 h-6 w-6 text-red-400" />
          <span className="text-hyphen-gray-400">
            Something went wrong while we were fetching this farm, please try
            again later.
          </span>
        </div>
      </section>
    );
  }

  const rewardRatePerSecondInUSD =
    rewardsRatePerSecond && rewardToken && rewardTokenPriceInUSD
      ? Number.parseFloat(
          ethers.utils.formatUnits(
            rewardsRatePerSecond,
            rewardToken[chain.chainId].decimal,
          ),
        ) * rewardTokenPriceInUSD[rewardToken.coinGeckoId as string].usd
      : 0;

  const totalValueLockedInUSD =
    suppliedLiquidityByToken && tokenPriceInUSD
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidityByToken, decimal),
        ) * tokenPriceInUSD[coinGeckoId as string].usd
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
    rewardsRatePerSecond && rewardToken && chain
      ? Number.parseFloat(
          ethers.utils.formatUnits(
            rewardsRatePerSecond,
            rewardToken[chain.chainId].decimal,
          ),
        ) * SECONDS_IN_24_HOURS
      : 0;

  function handleFarmOverviewClick() {
    queryClient.removeQueries('userPositions');
    navigate(`add-staking-position/${chain.chainId}/${symbol}`);
  }

  return (
    <section
      className="grid h-37.5 w-full cursor-pointer grid-cols-2 items-center px-[2.375rem] text-hyphen-gray-400 xl:grid-cols-3 xl:px-[3.125rem]"
      style={{ backgroundColor: chainColor }}
      onClick={handleFarmOverviewClick}
    >
      <div className="flex items-center">
        <img
          src={tokenImage}
          alt={symbol}
          className="mr-2 h-6 w-6 xl:h-8 xl:w-8"
        />
        <div className="flex flex-col">
          <span className="font-mono text-sm xl:text-2xl">{symbol}</span>
          <span className="text-xxxs font-bold uppercase text-hyphen-gray-300 xl:text-xxs">
            {chain.name}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-self-end xl:items-center xl:justify-self-center">
        <div className="flex items-center justify-center">
          <span className="font-mono text-sm xl:text-2xl">
            {rewardAPY > 10000
              ? '>10,000%'
              : `${Number.parseFloat(rewardAPY.toFixed(3))}%`}
          </span>
        </div>
        <span className="text-xxxs font-bold uppercase text-hyphen-gray-300 xl:text-xxs">
          Annualized
        </span>
      </div>
      <div className="hidden h-12 w-[250px] flex-col items-end justify-self-end xl:flex">
        <span className="font-mono text-2xl">
          {rewardsPerDay >= 0 ? (
            <div className="flex items-center">
              <img
                src={rewardToken?.image}
                alt={rewardToken?.symbol}
                className="mr-2.5 h-5 w-5"
              />
              {makeNumberCompact(
                Number.parseFloat(rewardsPerDay.toFixed(3)),
                3,
              )}{' '}
              {rewardToken?.symbol}
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
        <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
          Per Day
        </span>
      </div>
    </section>
  );
}

export default FarmOverview;

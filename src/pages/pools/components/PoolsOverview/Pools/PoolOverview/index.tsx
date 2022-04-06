import { ethers } from 'ethers';
import { useQuery } from 'react-query';
import { request, gql } from 'graphql-request';
import Skeleton from 'react-loading-skeleton';
import { HiInformationCircle, HiOutlineXCircle } from 'react-icons/hi';
import { ChainConfig } from 'config/chains';
import tokens from 'config/tokens';
import CustomTooltip from 'components/CustomTooltip';
import ProgressBar from 'components/ProgressBar';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import useWhitelistPeriodManager from 'hooks/contracts/useWhitelistPeriodManager';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { useNavigate } from 'react-router-dom';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';

interface IPoolOverview {
  chain: ChainConfig;
  token: any;
}

function PoolOverview({ chain, token }: IPoolOverview) {
  const navigate = useNavigate();
  const { address, chainColor, coinGeckoId, decimal, symbol, tokenImage } =
    token;
  const { v2GraphURL: v2GraphEndpoint } = chain;

  const { getSuppliedLiquidityByToken, getTotalLiquidity } =
    useLiquidityProviders(chain);
  const { getTokenTotalCap } = useWhitelistPeriodManager(chain);
  const { getRewardRatePerSecond, getRewardTokenAddress } =
    useLiquidityFarming(chain);

  const { data: totalLiquidity, isError: totalLiquidityError } = useQuery(
    ['totalLiquidity', address],
    () => getTotalLiquidity(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: tokenTotalCap, isError: tokenTotalCapError } = useQuery(
    ['tokenTotalCap', address],
    () => getTokenTotalCap(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: feeAPYData, isError: feeAPYDataError } = useQuery(
    ['apy', address],
    async () => {
      if (!v2GraphEndpoint || !address) return;

      const { rollingApyFor24Hour } = await request(
        v2GraphEndpoint,
        gql`
          query {
            rollingApyFor24Hour(id: "${address.toLowerCase()}") {
              apy
            }
          }
        `,
      );
      return rollingApyFor24Hour;
    },
    {
      // Execute only when tokenAddress is available.
      enabled: !!address,
    },
  );

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

  const rewardToken = rewardTokenAddress
    ? tokens.find(tokenObj => {
        return tokenObj[chain.chainId]
          ? tokenObj[chain.chainId].address.toLowerCase() ===
              rewardTokenAddress.toLowerCase()
          : false;
      })
    : undefined;

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
    totalLiquidityError ||
    tokenTotalCapError ||
    feeAPYDataError ||
    suppliedLiquidityByTokenError ||
    tokenPriceInUSDError ||
    rewardsRatePerSecondError ||
    rewardTokenAddressError ||
    rewardTokenPriceInUSDError;

  if (isError) {
    return (
      <article className="mb-2.5 rounded-10 bg-white p-2.5">
        <section className="flex items-center justify-center px-7 pt-16 pb-24">
          <HiOutlineXCircle className="mr-4 h-6 w-6 text-red-400" />
          <p className="text-hyphen-gray-400">
            Something went wrong while we were fetching this pool, please try
            again later.
          </p>
        </section>
      </article>
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

  const feeAPY = feeAPYData
    ? Number.parseFloat(Number.parseFloat(feeAPYData.apy).toFixed(2))
    : 0;
  const APY = rewardAPY + feeAPY;

  const formattedTotalLiquidity =
    totalLiquidity && decimal
      ? Number.parseFloat(ethers.utils.formatUnits(totalLiquidity, decimal))
      : totalLiquidity;

  const formattedTokenTotalCap =
    tokenTotalCap && decimal
      ? Number.parseFloat(ethers.utils.formatUnits(tokenTotalCap, decimal))
      : tokenTotalCap;

  function handlePoolOverviewClick() {
    navigate(`add-liquidity/${chain.chainId}/${symbol}`);
  }

  return (
    <section
      className="grid h-37.5 w-full cursor-pointer grid-cols-2 items-center px-[2.375rem] text-hyphen-gray-400 xl:grid-cols-3 xl:px-[3.125rem]"
      style={{ backgroundColor: chainColor }}
      onClick={handlePoolOverviewClick}
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
            {APY > 10000 ? '>10,000%' : `${Number.parseFloat(APY.toFixed(3))}%`}
          </span>
          <HiInformationCircle
            className="ml-1 hidden h-5 w-5 cursor-default text-hyphen-gray-400 xl:flex"
            data-tip
            data-for={`${chain.name}-${symbol}-apy`}
            onClick={e => e.stopPropagation()}
          />
          <CustomTooltip id={`${chain.name}-${symbol}-apy`}>
            <p>
              Reward APY:{' '}
              {rewardAPY > 10000
                ? '>10,000%'
                : `${Number.parseFloat(rewardAPY.toFixed(3))}%`}
            </p>
            <p>Fee APY: {feeAPY >= 0 ? `${feeAPY}%` : '...'}</p>
          </CustomTooltip>
        </div>
        <span className="text-xxxs font-bold uppercase text-hyphen-gray-300 xl:text-xxs">
          Annualized
        </span>
      </div>
      <div className="hidden h-12 w-[250px] flex-col justify-end justify-self-end xl:flex">
        <ProgressBar
          currentProgress={formattedTotalLiquidity}
          minProgressWidth={4}
          totalProgress={formattedTokenTotalCap}
        />
        <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
          <span>Pool cap</span>
          <span className="flex">
            {formattedTotalLiquidity >= 0 && formattedTokenTotalCap >= 0 ? (
              <>
                {makeNumberCompact(formattedTotalLiquidity)} {symbol} /{' '}
                {makeNumberCompact(formattedTokenTotalCap)} {symbol}
              </>
            ) : (
              <Skeleton
                baseColor="#615ccd20"
                enableAnimation
                highlightColor="#615ccd05"
                className="!mx-1 !w-20"
              />
            )}
          </span>
        </div>
      </div>
    </section>
  );
}

export default PoolOverview;

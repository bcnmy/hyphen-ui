import { ethers } from 'ethers';
import { useQuery } from 'react-query';
import { request, gql } from 'graphql-request';
import Skeleton from 'react-loading-skeleton';
import { HiInformationCircle } from 'react-icons/hi';
import { ChainConfig, chains } from 'config/chains';
import tokens, { TokenConfig } from 'config/tokens';
import CustomTooltip from 'components/CustomTooltip';
import ProgressBar from 'components/ProgressBar';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import useWhitelistPeriodManager from 'hooks/contracts/useWhitelistPeriodManager';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { useNavigate } from 'react-router-dom';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';

interface IFarmOverview {
  chain: ChainConfig;
  token: any;
}

function FarmOverview({ chain, token }: IFarmOverview) {
  const navigate = useNavigate();
  const { address, chainColor, coinGeckoId, decimal, symbol, tokenImage } =
    token;

  const { getSuppliedLiquidityByToken } = useLiquidityProviders(chain);
  const { getRewardRatePerSecond, getRewardTokenAddress } =
    useLiquidityFarming(chain);

  const { data: suppliedLiquidity } = useQuery(
    ['suppliedLiquidity', address],
    () => getSuppliedLiquidityByToken(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: tokenPriceInUSD } = useQuery(
    ['tokenPriceInUSD', coinGeckoId],
    () =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`,
      ).then(res => res.json()),
    {
      enabled: !!coinGeckoId,
    },
  );

  const { data: rewardsRatePerSecond } = useQuery(
    ['rewardsRatePerSecond', address],
    () => getRewardRatePerSecond(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: rewardTokenAddress } = useQuery(
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

  const { data: rewardTokenPriceInUSD } = useQuery(
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
    rewardsRatePerSecond && rewardToken && rewardTokenPriceInUSD
      ? Number.parseFloat(
          ethers.utils.formatUnits(
            rewardsRatePerSecond,
            rewardToken[chain.chainId].decimal,
          ),
        ) * rewardTokenPriceInUSD[rewardToken.coinGeckoId as string].usd
      : undefined;

  const totalValueLockedInUSD =
    suppliedLiquidity && tokenPriceInUSD
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidity, decimal),
        ) * tokenPriceInUSD[coinGeckoId as string].usd
      : undefined;

  const secondsInYear = 31536000;

  const rewardAPY =
    rewardRatePerSecondInUSD && totalValueLockedInUSD
      ? Math.pow(
          1 + rewardRatePerSecondInUSD / totalValueLockedInUSD,
          secondsInYear,
        ) - 1
      : undefined;

  console.log(
    chain.name,
    symbol,
    rewardRatePerSecondInUSD,
    totalValueLockedInUSD,
  );

  const SECONDS_IN_24_HOURS = 86400;
  const rewardsPerDay =
    rewardsRatePerSecond && rewardToken && chain
      ? (
          Number.parseFloat(
            ethers.utils.formatUnits(
              rewardsRatePerSecond,
              rewardToken[chain.chainId].decimal,
            ),
          ) * SECONDS_IN_24_HOURS
        ).toFixed(3)
      : null;

  function handleFarmOverviewClick() {
    navigate(`add-staking-position/${chain.chainId}/${symbol}`);
  }

  return (
    <section
      className="relative flex h-37.5 w-full cursor-pointer items-center justify-center text-hyphen-gray-400"
      style={{ backgroundColor: chainColor }}
      onClick={handleFarmOverviewClick}
    >
      <div className="absolute left-12.5 flex items-center">
        <img src={tokenImage} alt={symbol} className="mr-2 h-8 w-8" />
        <div className="flex flex-col">
          <span className="font-mono text-2xl">{symbol}</span>
          <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
            {chain.name}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center">
          <span className="font-mono text-2xl">
            {rewardAPY !== null || rewardAPY !== undefined
              ? `${rewardAPY}%`
              : '...'}
          </span>
        </div>
        <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
          Annualized
        </span>
      </div>
      <div className="absolute right-12.5 flex h-12 w-[250px] flex-col items-end justify-end">
        <span className="font-mono text-2xl">
          {rewardsPerDay} {rewardToken?.symbol}
        </span>
        <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
          Per Day
        </span>
      </div>
    </section>
  );
}

export default FarmOverview;
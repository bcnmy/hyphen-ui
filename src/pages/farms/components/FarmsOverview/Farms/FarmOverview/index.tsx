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

interface IFarmOverview {
  chain: ChainConfig;
  token: any;
}

function FarmOverview({ chain, token }: IFarmOverview) {
  const navigate = useNavigate();
  const { address, chainColor, decimal, symbol, tokenImage } = token;

  const { getRewardsPerSecond, getRewardTokenAddress } =
    useLiquidityFarming(chain);

  // const { data: rewardsPerSecond } = useQuery(
  //   ['rewardsPerSecond', address],
  //   () => getRewardsPerSecond(address),
  //   {
  //     // Execute only when address is available.
  //     enabled: !!address,
  //   },
  // );

  // const { data: rewardTokenAddress } = useQuery(
  //   ['rewardTokenAddress', address],
  //   () => getRewardTokenAddress(address),
  //   {
  //     // Execute only when address is available.
  //     enabled: !!address,
  //   },
  // );

  const SECONDS_IN_24_HOURS = 86400;
  // const rewardsPerDay = rewardsPerSecond
  //   ? rewardsPerSecond * SECONDS_IN_24_HOURS
  //   : null;
  // const rewardToken = tokens.find(
  //   tokenObj =>
  //     tokenObj[chain.chainId].address.toLowerCase() ===
  //     rewardTokenAddress.toLowerCase(),
  // );
  const rewardAPY = 55;

  function handleFarmOverviewClick() {
    console.log('handleFarmOverviewClick');
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
        <span className="font-mono text-2xl">566.67 BICO</span>
        <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
          Per Day
        </span>
      </div>
    </section>
  );
}

export default FarmOverview;

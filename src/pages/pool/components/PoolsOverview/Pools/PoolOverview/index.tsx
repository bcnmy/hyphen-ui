import { ethers } from 'ethers';
import { useQuery } from 'react-query';
import { request, gql } from 'graphql-request';
import Skeleton from 'react-loading-skeleton';
import { HiInformationCircle } from 'react-icons/hi';
import { ChainConfig, chains } from 'config/chains';
import tokens, { TokenConfig } from 'config/tokens';
import CustomTooltip from 'components/CustomTooltip';
import ProgressBar from 'components/ProgressBar';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import useWhitelistPeriodManager from 'hooks/contracts/useWhitelistPeriodManager';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { useNavigate } from 'react-router-dom';

interface IPoolOverview {
  chain: ChainConfig;
  token: any;
}

function PoolOverview({ chain, token }: IPoolOverview) {
  const navigate = useNavigate();
  const { address, chainColor, decimal, symbol, tokenImage } = token;
  const { v2GraphURL: v2GraphEndpoint } = chain;

  const { getTotalLiquidity } = useLiquidityProviders(chain);
  const { getTokenTotalCap } = useWhitelistPeriodManager(chain);

  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', address],
    () => getTotalLiquidity(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: tokenTotalCap } = useQuery(
    ['tokenTotalCap', address],
    () => getTokenTotalCap(address),
    {
      // Execute only when address is available.
      enabled: !!address,
    },
  );

  const { data: feeAPY } = useQuery(
    ['apy', address],
    async () => {
      if (!v2GraphEndpoint || !address) return;

      const {
        rollingApyFor24Hour: { apy: feeAPY },
      } = await request(
        v2GraphEndpoint,
        gql`
          query {
            rollingApyFor24Hour(id: "0", where: { tokenAddress: $address }) {
              apy
            }
          }
        `,
      );
      return feeAPY;
    },
    {
      // Execute only when tokenAddress is available.
      enabled: !!address,
    },
  );

  const rewardAPY = 0;
  const feeAPYAsFloat = Number.parseFloat(Number.parseFloat(feeAPY).toFixed(2));
  const APY = rewardAPY + feeAPYAsFloat;

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
      className="relative flex h-37.5 w-full cursor-pointer items-center justify-center text-hyphen-gray-400"
      style={{ backgroundColor: chainColor }}
      onClick={handlePoolOverviewClick}
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
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-mono text-2xl">{APY ? APY : '...'}%</span>
          <HiInformationCircle
            className="ml-1 h-5 w-5 cursor-default text-hyphen-gray-400"
            data-tip
            data-for={`${chain.name}-${symbol}-apy`}
            onClick={e => e.stopPropagation()}
          />
          <CustomTooltip id={`${chain.name}-${symbol}-apy`}>
            <p>Reward APY: {rewardAPY}%</p>
            <p>Fee APY: {feeAPYAsFloat ? feeAPYAsFloat : '...'}%</p>
          </CustomTooltip>
        </div>
        <span className="text-xxs font-bold uppercase text-hyphen-gray-300">
          Annualized
        </span>
      </div>
      <div className="absolute right-12.5 flex h-12 w-[250px] flex-col justify-end">
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
